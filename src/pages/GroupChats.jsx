// Main refactored GroupChats component
import React, { useState } from 'react';
import { useOutletContext } from "react-router-dom";
import { MessageCircle, Users, UserMinus, X } from 'lucide-react';

import { useGroupChats } from '../hooks/useGroupChats';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useUsers } from "../context/UsersContext";

import GroupChatsList from '../components/GroupChatsList';
import ChatMessagesArea from '../components/ChatMessagesArea';
import GroupMessageInput from '../components/GroupMessageInput';
import CreateGroupModal from '../components/CreateGroupModal';

const GroupChats = () => {
  const { user, allMessages } = useOutletContext();
  const { users } = useUsers();
  
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
    updateChatWithMessage 
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
    <div className="flex h-[80vh] overflow-auto">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-900 text-white rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-5 h-[75vh]">
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
                <div className="w-[60%] bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
                  {selectedGroup ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-white/5 backdrop-blur-md rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="text-orange-400" size={24} />
                          <div>
                            <h2 className="font-bold text-white">{selectedGroup.name}</h2>
                            <p className="text-sm text-gray-400">{selectedGroup.users?.length || 0} participants</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowParticipants(!showParticipants)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 hover:text-orange-400"
                          >
                            <Users className="text-gray-400 hover:text-orange-400" size={20} />
                          </button>
                          <button 
                            onClick={handleLeaveGroup}
                            className="p-2 hover:bg-red-900 rounded-lg transition-colors duration-200"
                          >
                            <UserMinus className="text-red-400" size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        <ChatMessagesArea
                          messages={messages}
                          isLoadingMessages={isLoadingMessages}
                          messagesEndRef={messagesEndRef}
                          user={user}
                          formatTime={formatTime}
                        />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-700 bg-gray-800 sticky bottom-0 rounded-b-lg">
                        <GroupMessageInput
                          onSendMessage={handleSendMessage}
                          disabled={!selectedGroup}
                        />
                      </div>

                      {/* Participants Popup */}
                      {showParticipants && (
                        <div className="absolute right-8 top-20 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4 w-64 z-10">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-white">Participants</h3>
                            <button 
                              onClick={() => setShowParticipants(false)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
                            >
                              <X size={16} className="text-gray-400" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {selectedGroup.users?.map((participant) => (
                              <div key={participant._id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600">
                                  {participant.name?.[0] || participant._id?.[0] || '?'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-white">{participant.name || participant._id || 'Unknown'}</p>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${participant.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                    <span className="text-xs text-gray-400">
                                      {participant.online ? 'Online' : 'Offline'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Welcome Screen
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-center p-8">
                      <div className="mb-8 relative">
                        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 animate-pulse">
                          <MessageCircle className="h-16 w-16 text-white" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-400 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                        <div className="absolute -bottom-2 -left-3 w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                        <div className="absolute top-8 -left-8 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse" style={{ animationDelay: "1000ms" }}></div>
                      </div>
                      
                      <p className="text-xl mb-8 max-w-md text-gray-300 leading-relaxed">
                        Select a group from the sidebar to start chatting, or create a new one!
                      </p>
                      
                      <div className="flex flex-col space-y-4 items-center">
                        <div className="flex items-center space-x-6 text-gray-400 text-sm mt-8">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Secure</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "500ms" }}></div>
                            <span>Real-time</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "1000ms" }}></div>
                            <span>Lightning Fast</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Create Group Modal */}
        {showCreateModal && (
          <CreateGroupModal
            users={users.filter(u => u._id !== user.id)}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateGroupSubmit}
          />
        )}

        {/* Mobile Chat Modal */}
        {isMobile && isOffcanvasOpen && selectedGroup && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseMobile} />
            <div className="absolute inset-0 bg-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                <button 
                  onClick={handleCloseMobile}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
                <MessageCircle className="text-orange-400" size={24} />
                <div className="flex-1">
                  <h2 className="font-bold text-white">{selectedGroup.name}</h2>
                  <p className="text-sm text-gray-400">{selectedGroup.users?.length || 0} participants</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Users className="text-gray-400 hover:text-orange-400" size={20} />
                  </button>
                  <button 
                    onClick={handleLeaveGroup}
                    className="p-2 hover:bg-red-900 rounded-lg transition-colors duration-200"
                  >
                    <UserMinus className="text-red-400" size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <ChatMessagesArea
                  messages={messages}
                  isLoadingMessages={isLoadingMessages}
                  messagesEndRef={messagesEndRef}
                  user={user}
                  formatTime={formatTime}
                />
              </div>

              <div className="p-4 border-t border-gray-700">
                <GroupMessageInput
                  onSendMessage={handleSendMessage}
                  disabled={!selectedGroup}
                />
              </div>

              {/* Mobile Participants Popup */}
              {showParticipants && (
                <div className="absolute inset-x-4 top-20 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4 z-10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white">Participants</h3>
                    <button 
                      onClick={() => setShowParticipants(false)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {selectedGroup.users?.map((participant) => (
                      <div key={participant._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600">
                          {participant.name?.[0] || participant._id?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{participant.name || participant._id || 'Unknown'}</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${participant.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className="text-xs text-gray-400">
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
        )}
      </div>
    </div>
  );
};

export default GroupChats;
                