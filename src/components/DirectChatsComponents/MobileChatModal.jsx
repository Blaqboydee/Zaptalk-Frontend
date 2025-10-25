import React from "react";
import { X } from "lucide-react";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";

const MobileChatModal = ({
  isOpen,
  onClose,
  selectedChatId,
  otherUser,
  messages,
  user,
  isLoadingMessages,
  messagesEndRef,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isMobile = true
}) => {
  // Early return if modal should not be displayed
  if (!isOpen || !selectedChatId || !otherUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="absolute inset-0 flex flex-col"
        style={{ backgroundColor: '#0F0F1A' }}
      >
        {/* Header */}
        <div 
          className="h-[70px] flex items-center justify-between px-4"
          style={{ 
            borderBottom: '1px solid #2D2640',
            backgroundColor: '#1A1625'
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: '#252032' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
              aria-label="Close chat"
            >
              <X size={20} className="text-white" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: '#8B5CF6' }}
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

              {/* Online Status Indicator */}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
                  otherUser?.status?.state === "online" ? "animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: otherUser?.status?.state === "online" ? '#10B981' : '#71717A',
                  border: '2px solid #1A1625'
                }}
                aria-label={`User is ${otherUser?.status?.state || 'offline'}`}
              />
            </div>

            {/* User Info */}
            <div>
              <h2 className="font-bold text-white text-lg">
                {otherUser.name || "Chat"}
              </h2>
              <p 
                className="text-xs"
                style={{ 
                  color: otherUser?.status?.state === "online" ? '#22D3EE' : '#71717A'
                }}
              >
                {otherUser?.status?.state || 'offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            user={user}
            otherUser={otherUser}
            isLoadingMessages={isLoadingMessages}
            messagesEndRef={messagesEndRef}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            isMobile={isMobile}
            selectedChatId={selectedChatId}
          />
        </div>

        {/* Message Input */}
        <div style={{ borderTop: '1px solid #2D2640' }}>
          <MessageInput 
            onSendMessage={onSendMessage}
            selectedChatId={selectedChatId}
            user={user}
            otherUser={otherUser}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileChatModal;