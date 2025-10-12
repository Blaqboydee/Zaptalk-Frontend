import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  selectedChatId,
  user,
  otherUser
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const userId = user.id
  const otherUserId = otherUser._id
  
  // Typing indicator hook
  const { isTyping, otherUserTyping, startTyping, stopTyping } = useTypingIndicator(
    selectedChatId, 
   userId,
   otherUserId
  );

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max height of ~3 lines
    }
  }, [message]);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    // Stop typing when sending message
    stopTyping();
    
    onSendMessage(trimmedMessage);
    setMessage("");
  }, [message, onSendMessage, disabled, stopTyping]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    // console.log(newValue);
    
    setMessage(newValue);
    
    // Start typing indicator when user types
    if (newValue.trim() && !disabled) {
      startTyping();
    } else if (!newValue.trim()) {
      stopTyping();
    }
  }, [startTyping, stopTyping, disabled]);

  // Stop typing on blur
  const handleBlur = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  return (
    <div className="border-t border-gray-600 sticky w-full bottom-0 z-50 bg-gray-800">
      {/* Typing Indicator */}
      {otherUserTyping && (
        <div className="px-4 py-2 text-sm text-gray-400 bg-gray-750 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Typing...</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none scrollbar-hidden"
              disabled={disabled}
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character count (optional) */}
            {message.length > 400 && (
              <div className="absolute -top-6 right-2 text-xs text-gray-400">
                {message.length}/500
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className={`
              px-4 py-3 rounded-xl flex items-center justify-center min-w-[48px] h-12
              transition-all duration-200 transform
              ${message.trim() && !disabled
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-lg hover:shadow-orange-500/25'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
              }
            `}
            disabled={!message.trim() || disabled}
            aria-label="Send message"
          >
            <Send 
              size={18} 
              className={`text-white ${message.trim() && !disabled ? 'animate-pulse' : ''}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;