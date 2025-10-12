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
  // console.log(selectedChatId);
  
  // Early return if modal should not be displayed
  if (!isOpen || !selectedChatId || !otherUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="absolute inset-0 bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="h-[70px] border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="hover:bg-gray-700 rounded-full p-2 transition-colors duration-200"
              aria-label="Close chat"
            >
              <X size={20} className="text-white" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
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
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                  otherUser?.status?.state === "online" ? "bg-green-500" : "bg-gray-400"
                } border-2 border-gray-800 rounded-full`}
                aria-label={`User is ${otherUser?.status?.state || 'offline'}`}
              />
            </div>

            {/* User Info */}
            <div>
              <h2 className="font-bold text-white text-lg">
                {otherUser.name || "Chat"}
              </h2>
              <p className={`text-xs ${
                otherUser?.status?.state === "online" ? "text-green-400" : "text-gray-400"
              }`}>
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
        <div className="border-t border-gray-700 bg-gray-800">
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