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
  const userId = user.id;
  const otherUserId = otherUser._id;
  
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
    <div 
      className="sticky w-full bottom-0 z-50"
      style={{
        borderTop: '1px solid #2D2640',
        backgroundColor: '#1A1625'
      }}
    >
      {/* Typing Indicator */}
      {otherUserTyping && (
        <div 
          className="px-4 py-2 text-sm animate-fade-in"
          style={{ 
            backgroundColor: '#252032',
            borderBottom: '1px solid #2D2640',
            color: '#A1A1AA'
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div 
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: '#8B5CF6' }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ 
                  backgroundColor: '#8B5CF6',
                  animationDelay: '0.1s'
                }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ 
                  backgroundColor: '#8B5CF6',
                  animationDelay: '0.2s'
                }}
              />
            </div>
            <span>{otherUser?.name || 'User'} is typing...</span>
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
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 resize-none scrollbar-hidden"
              style={{
                backgroundColor: '#252032',
                border: '1px solid #2D2640',
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8B5CF6';
                e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2D2640';
                e.target.style.boxShadow = 'none';
                handleBlur();
              }}
              disabled={disabled}
              rows="1"
            />
            
            {/* Character count */}
            {message.length > 400 && (
              <div 
                className="absolute -top-6 right-2 text-xs animate-fade-in"
                style={{ color: message.length > 480 ? '#EF4444' : '#71717A' }}
              >
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
                ? 'shadow-lg hover:scale-105'
                : 'cursor-not-allowed opacity-50'
              }
            `}
            style={{
              backgroundColor: message.trim() && !disabled ? '#8B5CF6' : '#6D28D9'
            }}
            onMouseEnter={(e) => {
              if (message.trim() && !disabled) {
                e.currentTarget.style.backgroundColor = '#7C3AED';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim() && !disabled) {
                e.currentTarget.style.backgroundColor = '#8B5CF6';
                e.currentTarget.style.boxShadow = '';
              }
            }}
            disabled={!message.trim() || disabled}
            aria-label="Send message"
          >
            <Send 
              size={18} 
              className={`text-white ${message.trim() && !disabled ? 'animate-pulse' : ''}`}
            />
          </button>
        </div>

        {/* Input hint */}
        <div 
          className="mt-2 text-xs flex items-center justify-between"
          style={{ color: '#71717A' }}
        >
          <span>Press Enter to send, Shift+Enter for new line</span>
          {message.trim() && (
            <span 
              className="animate-fade-in"
              style={{ color: '#8B5CF6' }}
            >
              Ready to send
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;