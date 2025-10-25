import React, { useState } from 'react';
import { useOutletContext } from "react-router-dom";
import { MessageCircle, Users, UserMinus, X, Zap } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import { useGroupChats } from '../hooks/useGroupChats';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

import GroupChatsList from '../components/GroupComponents/GroupChatsList';
import ChatMessagesArea from '../components/DirectChatsComponents/ChatMessagesArea';
import GroupMessageInput from '../components/GroupComponents/GroupMessageInput';
import CreateGroupModal from '../components/GroupComponents/CreateGroupModal';

const GroupChats = () => {
  const { user, allMessages } = useOutletContext();
  const { friends } = useFriends();
  
  // State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Custom hooks
  const { isMobile, isOffcanvasOpen, openMobileChat, closeMobileChat } = useResponsiveLayout();
  const { 
    groupChats, 
    error: groupError, 
    setError: setGroupError,
    createGroup, 
    leaveGroup,
  } = useGroupChats(user?.id);
  
  const { 
    messages, 
    isLoadingMessages, 
    messagesEndRef, 
    sendMessage,
    error: messageError,
    setError: setMessageError
  } = useGroupMessages(selectedGroup, user);

  // Helper functions
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    return diffInHours < 24
      ? messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : messageDate.toLocaleDateString();
  };

  // Event handlers
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    if (isMobile) {
      openMobileChat();
    }
  };

  const handleCreateGroupSubmit = async (groupName, selectedUserIds) => {
    try {
      const newGroup = await createGroup(groupName, selectedUserIds, user.id);
      setShowCreateModal(false);
      setSelectedGroup(newGroup);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;

    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(selectedGroup._id, user.id);
        setSelectedGroup(null);
        closeMobileChat();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleSendMessage = async (messageContent) => {
    try {
      await sendMessage(messageContent);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCloseMobile = () => {
    closeMobileChat();
    if (isMobile) {
      setSelectedGroup(null);
    }
  };

  const error = groupError || messageError;

  return (
    <div className="flex h-[80vh] overflow-auto" style={{ backgroundColor: '#0F0F1A' }}>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 sm:px-6 lg:px-8">
          <div>
            {/* Error Message */}
            {error && (
              <div 
                className="mb-4 p-3 rounded-lg animate-fade-in"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#EF4444'
                }}
              >
                {error}
              </div>
            )}

            <div className="flex">
              {/* Groups List */}
              <GroupChatsList
                groupChats={groupChats}
                selectedGroup={selectedGroup}
                onSelectGroup={handleSelectGroup}
                onCreateGroup={() => setShowCreateModal(true)}
                allMessages={allMessages}
                formatTime={formatTime}
                isMobile={isMobile}
                isOffcanvasOpen={isOffcanvasOpen}
              />

              {/* Desktop Chat Area */}
              {!isMobile && (
                <div className="w-[70%] flex flex-col">
                  {selectedGroup ? (
                    <div className="flex flex-col h-full animate-fade-in">
                      {/* Chat Header */}
                      <div 
                        className="p-4 flex justify-between items-center"
                        style={{ 
                          backgroundColor: '#1A1625',
                          borderBottom: '1px solid #2D2640'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: '#8B5CF6' }}
                          >
                            <Users className="text-white" size={20} />
                          </div>
                          <div>
                            <h2 className="font-bold text-white">{selectedGroup.name}</h2>
                            <p className="text-sm" style={{ color: '#A1A1AA' }}>
                              {selectedGroup.users?.length || 0} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowParticipants(!showParticipants)}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: '#252032' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
                          >
                            <Users size={20} style={{ color: '#A1A1AA' }} />
                          </button>
                          <button 
                            onClick={handleLeaveGroup}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                          >
                            <UserMinus size={20} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <ChatMessagesArea
                          messages={messages}
                          isLoadingMessages={isLoadingMessages}
                          messagesEndRef={messagesEndRef}
                          user={user}
                          formatTime={formatTime}
                        />
                      </div>

                      {/* Message Input */}
                      <div 
                        className="p-4 sticky bottom-0"
                        style={{ 
                          backgroundColor: '#1A1625',
                          borderTop: '1px solid #2D2640'
                        }}
                      >
                        <GroupMessageInput
                          onSendMessage={handleSendMessage}
                          disabled={!selectedGroup}
                        />
                      </div>

                      {/* Participants Popup */}
                      {showParticipants && (
                        <ParticipantsPopup
                          participants={selectedGroup.users}
                          onClose={() => setShowParticipants(false)}
                        />
                      )}
                    </div>
                  ) : (
                    <WelcomeScreen />
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Create Group Modal */}
        {showCreateModal && (
          <CreateGroupModal
            friends={friends}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateGroupSubmit}
          />
        )}

        {/* Mobile Chat Modal */}
        {isMobile && isOffcanvasOpen && selectedGroup && (
          <MobileChatModal
            selectedGroup={selectedGroup}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            messagesEndRef={messagesEndRef}
            user={user}
            formatTime={formatTime}
            showParticipants={showParticipants}
            onToggleParticipants={() => setShowParticipants(!showParticipants)}
            onLeaveGroup={handleLeaveGroup}
            onClose={handleCloseMobile}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

// Welcome Screen Component
const WelcomeScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
    <div className="mb-8 relative">
      <div 
        className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        <Users className="h-16 w-16 text-white" />
      </div>
      <div
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full animate-bounce"
        style={{ 
          backgroundColor: '#22D3EE',
          animationDelay: '200ms'
        }}
      />
      <div
        className="absolute -bottom-2 -left-3 w-6 h-6 rounded-full animate-bounce"
        style={{ 
          backgroundColor: '#8B5CF6',
          animationDelay: '600ms'
        }}
      />
      <div
        className="absolute top-8 -left-8 w-4 h-4 rounded-full animate-pulse"
        style={{ 
          backgroundColor: '#7C3AED',
          animationDelay: '1000ms'
        }}
      />
    </div>
    
    <p className="text-xl mb-8 max-w-md leading-relaxed" style={{ color: '#A1A1AA' }}>
      Select a group from the sidebar to start chatting, or create a new one!
    </p>
    
    <div className="flex items-center space-x-6 text-sm mt-8" style={{ color: '#71717A' }}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
        <span>Secure</span>
      </div>
      <div className="flex items-center space-x-2">
        <div 
          className="w-2 h-2 rounded-full animate-pulse" 
          style={{ backgroundColor: '#22D3EE', animationDelay: '500ms' }}
        />
        <span>Real-time</span>
      </div>
      <div className="flex items-center space-x-2">
        <div 
          className="w-2 h-2 rounded-full animate-pulse" 
          style={{ backgroundColor: '#8B5CF6', animationDelay: '1000ms' }}
        />
        <span>Lightning Fast</span>
      </div>
    </div>
  </div>
);

// Participants Popup Component
const ParticipantsPopup = ({ participants, onClose }) => (
  <div 
    className="absolute right-8 top-20 rounded-lg shadow-xl p-4 w-64 z-10 animate-fade-in"
    style={{ 
      backgroundColor: '#1A1625',
      border: '1px solid #2D2640'
    }}
  >
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold text-white">Participants</h3>
      <button 
        onClick={onClose}
        className="p-1 rounded transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: '#252032' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
      >
        <X size={16} style={{ color: '#A1A1AA' }} />
      </button>
    </div>
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {participants?.map((participant, index) => (
        <div 
          key={participant._id} 
          className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200"
          style={{ 
            backgroundColor: '#252032',
            animationDelay: `${index * 50}ms`
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {participant.name?.[0] || participant._id?.[0] || '?'}
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">
              {participant.name || participant._id || 'Unknown'}
            </p>
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: participant.online ? '#10B981' : '#71717A' 
                }}
              />
              <span 
                className="text-xs"
                style={{ color: participant.online ? '#22D3EE' : '#71717A' }}
              >
                {participant.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Mobile Chat Modal Component
const MobileChatModal = ({ 
  selectedGroup, 
  messages, 
  isLoadingMessages, 
  messagesEndRef, 
  user, 
  formatTime,
  showParticipants,
  onToggleParticipants,
  onLeaveGroup,
  onClose,
  onSendMessage
}) => (
  <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
    <div 
      className="absolute inset-0"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose} 
    />
    <div 
      className="absolute inset-0 flex flex-col"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #2D2640' }}
      >
        <button 
          onClick={onClose}
          className="p-2 rounded-full transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: '#252032' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
        >
          <X size={20} className="text-white" />
        </button>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#8B5CF6' }}
        >
          <Users className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-white">{selectedGroup.name}</h2>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            {selectedGroup.users?.length || 0} participants
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onToggleParticipants}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: '#252032' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
          >
            <Users size={20} style={{ color: '#A1A1AA' }} />
          </button>
          <button 
            onClick={onLeaveGroup}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          >
            <UserMinus size={20} style={{ color: '#EF4444' }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatMessagesArea
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          messagesEndRef={messagesEndRef}
          user={user}
          formatTime={formatTime}
        />
      </div>

      {/* Message Input */}
      <div 
        className="p-4"
        style={{ borderTop: '1px solid #2D2640' }}
      >
        <GroupMessageInput
          onSendMessage={onSendMessage}
          disabled={!selectedGroup}
        />
      </div>

      {/* Mobile Participants Popup */}
      {showParticipants && (
        <div 
          className="absolute inset-x-4 top-20 rounded-lg shadow-xl p-4 z-10 animate-fade-in"
          style={{ 
            backgroundColor: '#1A1625',
            border: '1px solid #2D2640'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-white">Participants</h3>
            <button 
              onClick={onToggleParticipants}
              className="p-1 rounded transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: '#252032' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
            >
              <X size={16} style={{ color: '#A1A1AA' }} />
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedGroup.users?.map((participant, index) => (
              <div 
                key={participant._id} 
                className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200"
                style={{ 
                  backgroundColor: '#252032',
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  {participant.name?.[0] || participant._id?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">
                    {participant.name || participant._id || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: participant.online ? '#10B981' : '#71717A' 
                      }}
                    />
                    <span 
                      className="text-xs"
                      style={{ color: participant.online ? '#22D3EE' : '#71717A' }}
                    >
                      {participant.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default GroupChats;