import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Plus,
  MessageCircle,
  Search,
  MoreVertical,
  Phone,
  Video,
  Zap,
} from "lucide-react";

import ping from '../assets/ping.wav';

// Import custom hooks
import { useSocket } from "../hooks/useSocket";
import { useChats } from "../hooks/useChats";
import { useMessages } from "../hooks/useMessages";
import { useChatInitialization } from "../hooks/useChatInitialization";
import { useResponsive } from "../hooks/useResponsive";
import { useGlobalSocket } from "../context/SocketContext";
import useSound from 'use-sound';

// Import components
import ChatListItem from "../components/DirectChatsComponents/ChatListItems";
import ChatMessages from "../components/DirectChatsComponents/ChatMessages";
import FriendsList from "../components/FriendsList";
import MessageInput from "../components/DirectChatsComponents/MessageInput";
import MobileChatModal from "../components/DirectChatsComponents/MobileChatModal";

export default function ChatsPage() {
  const { user, allMessages } = useOutletContext();
  const navigate = useNavigate();
  const { socket, setIsChatOpen, newMessage, registerChatUpdateCallback } = useGlobalSocket();
  const [playPing] = useSound(ping);

  // State
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // Custom hooks
  const { isMobile } = useResponsive();
  const {
    chats,
    addChat,
    handleSearch,
    searchTerm,
    filteredChats,
    updateChatOnMessage,
    isLoading,
  } = useChats(user?.id);

  const {
    messages,
    isLoadingMessages,
    messagesEndRef,
    addMessage,
    setMessages,
    editMessage,
    deleteMessage,
  } = useMessages(selectedChatId, user?.id);

  const handleMessageReceived = useCallback(
    (message) => {
      console.log("Socket received message:", message);
      if (message.senderId._id !== user.id) {
        playPing();
      }
      addMessage(message);
    },
    [addMessage, playPing, user.id]
  );

  // Socket hook
  const { sendMessage: socketSendMessage, messageData } = useSocket(
    selectedChatId,
    handleMessageReceived
  );

  // Register chat update callback
  useEffect(() => {
    registerChatUpdateCallback(updateChatOnMessage);
  }, [registerChatUpdateCallback, updateChatOnMessage]);

  // Sound notification
  useSound(messageData);

  // Chat initialization
  const { initChat } = useChatInitialization(
    user,
    chats,
    addChat,
    setSelectedChatId,
    setOtherUser,
    setMessages,
    isMobile,
    setIsOffcanvasOpen
  );

  // Message sending handler
  const sendMessage = useCallback(
    (messageContent) => {
      if (!messageContent.trim() || !selectedChatId || !user?.id) return;

      const tempMessage = {
        _id: `temp-${Date.now()}-${Math.random()}`,
        content: messageContent,
        senderId: user.id,
        chatId: selectedChatId,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      addMessage(tempMessage);

      socketSendMessage({
        content: messageContent,
        senderId: user.id,
        chatId: selectedChatId,
      });
    },
    [socketSendMessage, selectedChatId, user?.id, addMessage]
  );

  const openChat = useCallback(
    (chat) => {
      setIsChatOpen(true);
      const secondUser = chat.users?.find((u) => u._id !== user.id);
      if (!secondUser) return;

      if (socket) {
        console.log('Joining chat room:', chat._id);
        socket.emit("join_chat", chat._id);
      }

      setOtherUser(secondUser);
      setSelectedChatId(chat._id);

      if (isMobile) setIsOffcanvasOpen(true);
    },
    [user.id, isMobile, setIsChatOpen, socket]
  );

  const closeOffcanvas = useCallback(() => {
    setIsChatOpen(false);
    setIsOffcanvasOpen(false);
  }, [setIsChatOpen]);

  const chatToUpdate = chats.find((theChat) => theChat._id === newMessage?.chatId);

  return (
    <div style={{ backgroundColor: '#0F0F1A' }}>
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex-1 flex flex-col h-full">
          <main className="flex-1 p-4 overflow-hidden">
            {/* Search Bar */}
            <div className="relative mb-4 animate-fade-in">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                style={{ color: '#A1A1AA' }}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: '#1A1625',
                  border: '1px solid #2D2640',
                  focusRingColor: '#8B5CF6'
                }}
              />
            </div>

            {/* Chat List Content */}
            {isLoading ? (
              <LoadingState />
            ) : chats.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-auto">
                {filteredChats.map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    chats={chats}
                    user={user}
                    messageData={messageData}
                    allMessages={allMessages}
                    chatToUpdate={chatToUpdate}
                    openChat={openChat}
                  />
                ))}
              </div>
            ) : (
              <EmptyChatsState navigate={navigate} />
            )}
          </main>

          {/* Mobile Chat Modal */}
          <MobileChatModal
            isOpen={isOffcanvasOpen}
            onClose={closeOffcanvas}
            selectedChatId={selectedChatId}
            otherUser={otherUser}
            messages={messages}
            user={user}
            isLoadingMessages={isLoadingMessages}
            messagesEndRef={messagesEndRef}
            onSendMessage={sendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            isMobile={isMobile}
          />
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex h-[80vh] w-full overflow-hidden">
          {/* Left Sidebar - Chat List */}
          <div 
            className="w-96 flex flex-col overflow-hidden"
            style={{ borderRight: '1px solid #2D2640' }}
          >
            {/* Header */}
            <div 
              className="p-6"
              style={{ borderBottom: '1px solid #2D2640' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Messages</h1>
                <button
                  onClick={() => navigate("/users")}
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 group"
                  style={{ backgroundColor: '#8B5CF6' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
                >
                  <Plus className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors" 
                  style={{ color: '#71717A' }}
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: '#1A1625',
                    border: '1px solid #2D2640'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8B5CF6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2D2640';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Friends List */}
            <div 
              className="px-6 py-4"
              style={{ borderBottom: '1px solid #2D2640' }}
            >
              <FriendsList initChat={initChat} />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {filteredChats.length > 0 ? (
                <div className="p-4 space-y-2">
                  {filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat._id}
                      chat={chat}
                      chats={chats}
                      user={user}
                      messageData={messageData}
                      allMessages={allMessages}
                      chatToUpdate={chatToUpdate}
                      openChat={openChat}
                    />
                  ))}
                </div>
              ) : (
                <EmptyChatsState navigate={navigate} />
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div 
            className="flex-1 flex flex-col overflow-hidden"
            style={{ backgroundColor: '#0F0F1A' }}
          >
            {selectedChatId && otherUser ? (
              <>
                {/* Chat Header */}
                <ChatHeader otherUser={otherUser} />

                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden">
                  <ChatMessages
                    messages={messages}
                    selectedChatId={selectedChatId}
                    user={user}
                    otherUser={otherUser}
                    isLoadingMessages={isLoadingMessages}
                    messagesEndRef={messagesEndRef}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                  />
                </div>

                {/* Message Input */}
                <div 
                  className="z-50"
                  style={{ 
                    borderTop: '1px solid #2D2640',
                    backgroundColor: '#1A1625'
                  }}
                >
                  <MessageInput 
                    onSendMessage={sendMessage}
                    selectedChatId={selectedChatId}
                    user={user}
                    otherUser={otherUser}
                  />
                </div>
              </>
            ) : (
              <WelcomeScreen navigate={navigate} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
    <div className="relative mb-8">
      <div 
        className="w-16 h-16 rounded-full animate-spin"
        style={{ 
          border: '3px solid #2D2640',
          borderTopColor: '#8B5CF6'
        }}
      />
      <Zap 
        size={20} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ color: '#22D3EE' }}
      />
    </div>
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8B5CF6' }} />
      <div 
        className="w-2 h-2 rounded-full animate-pulse" 
        style={{ backgroundColor: '#8B5CF6', animationDelay: '0.2s' }}
      />
      <div 
        className="w-2 h-2 rounded-full animate-pulse" 
        style={{ backgroundColor: '#8B5CF6', animationDelay: '0.4s' }}
      />
    </div>
    <h2 className="text-lg font-semibold text-white mb-2">Loading chats...</h2>
    <p className="text-sm" style={{ color: '#A1A1AA' }}>
      Please wait while we fetch your conversations
    </p>
  </div>
);

// Empty Chats State Component
const EmptyChatsState = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-fade-in">
    <div className="mb-8 relative">
      <div 
        className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        <MessageCircle className="h-12 w-12 text-white" />
      </div>
      <div 
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse"
        style={{ backgroundColor: '#22D3EE' }}
      />
      <div 
        className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full animate-pulse"
        style={{ backgroundColor: '#8B5CF6', animationDelay: '300ms' }}
      />
    </div>
    <h2 className="text-xl font-bold mb-3 text-white">No chats yet</h2>
    <p className="text-sm mb-8 max-w-md" style={{ color: '#A1A1AA' }}>
      Start your first conversation by connecting with other users on ZapTalk!
    </p>
    <button
      onClick={() => navigate("/users")}
      className="text-white px-8 py-4 rounded-xl shadow-xl transition-all duration-200 hover:scale-105 font-semibold text-sm"
      style={{ backgroundColor: '#8B5CF6' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
    >
      Find Users
    </button>
  </div>
);

// Chat Header Component
const ChatHeader = ({ otherUser }) => (
  <div 
    className="h-16 flex items-center justify-between px-6"
    style={{ 
      backgroundColor: '#1A1625',
      borderBottom: '1px solid #2D2640'
    }}
  >
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
          style={{ 
            backgroundColor: '#8B5CF6',
            border: '2px solid #2D2640'
          }}
        >
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser?.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            otherUser?.name?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full shadow-lg"
          style={{
            backgroundColor: otherUser?.status?.state === "online" ? '#10B981' : '#71717A',
            border: '2px solid #1A1625'
          }}
        />
      </div>
      <div>
        <h2 className="font-semibold text-white">
          {otherUser.name || "Chat"}
        </h2>
        <p
          className="text-xs"
          style={{ color: otherUser?.status?.state === "online" ? '#22D3EE' : '#71717A' }}
        >
          {otherUser?.status?.state}
        </p>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <button 
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: '#252032' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
      >
        <Phone className="w-4 h-4" style={{ color: '#A1A1AA' }} />
      </button>
      <button 
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: '#252032' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
      >
        <Video className="w-4 h-4" style={{ color: '#A1A1AA' }} />
      </button>
      <button 
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: '#252032' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
      >
        <MoreVertical className="w-4 h-4" style={{ color: '#A1A1AA' }} />
      </button>
    </div>
  </div>
);

// Welcome Screen Component
const WelcomeScreen = ({ navigate }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
    <div className="mb-8 relative">
      <div 
        className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        <MessageCircle className="h-16 w-16 text-white" />
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
      Select a conversation from the sidebar to start chatting, or create a new one!
    </p>

    <div className="flex flex-col space-y-4 items-center">
      <button
        onClick={() => navigate("/users")}
        className="text-white px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 font-semibold text-lg transform hover:-translate-y-1"
        style={{ backgroundColor: '#8B5CF6' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
      >
        Start New Chat
      </button>

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
  </div>
);