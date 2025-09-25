import React, { useEffect } from "react";
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
  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [isOpen]);

  // Early return if modal should not be displayed
  if (!isOpen || !selectedChatId || !otherUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 touch-none">
      {/* Backdrop with glassmorphism */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm overflow-hidden"
        onClick={onClose}
      />
      
      {/* Modal Content - Glassmorphism Container */}
      <div className={`
        absolute inset-0 flex items-center justify-center p-5
        transition-all duration-500 ease-out
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        <div className={`
          w-full max-w-sm h-[75vh] max-h-[600px]
          bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20
          shadow-2xl flex flex-col overflow-hidden
          transition-all duration-500 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-10'}
        `}>
          {/* Header with glassmorphism */}
          <div className="h-[70px] border-b border-white/10 flex items-center justify-between px-5 bg-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110 flex items-center justify-center text-white"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>

              {/* User Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden border-2 border-white/20">
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
                    otherUser?.status?.state === "online" ? "bg-green-400" : "bg-gray-400"
                  } border-2 border-white/30 rounded-full shadow-lg`}
                  aria-label={`User is ${otherUser?.status?.state || 'offline'}`}
                />
              </div>

              {/* User Info */}
              <div>
                <h2 className="font-semibold text-white text-lg">
                  {otherUser.name || "Chat"}
                </h2>
                <p className={`text-xs ${
                  otherUser?.status?.state === "online" ? "text-green-300" : "text-white/60"
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
        </div>

        {/* Floating Message Input */}
        <div className={`
          absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-5 pb-5
          transition-all duration-500 delay-200 ease-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
        `}>
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