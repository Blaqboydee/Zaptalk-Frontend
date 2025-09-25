import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useTypingIndicator } from '../hooks/useTypingIndicator';

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
    <div className="w-full">
      {/* Typing Indicator with glassmorphism */}
      {otherUserTyping && (
        <div className="mb-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-white/80 text-sm">Typing...</span>
          </div>
        </div>
      )}

      {/* Input Container with glassmorphism */}
      <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-4">
        <div className="flex gap-3 items-end">
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 resize-none scrollbar-hidden backdrop-blur-md"
              disabled={disabled}
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {message.length > 400 && (
              <div className="absolute -top-6 right-2 text-xs text-white/60 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg">
                {message.length}/500
              </div>
            )}
          </div>

          {/* Send Button with glassmorphism */}
          <button
            onClick={handleSend}
            className={`
              px-4 py-3 rounded-2xl flex items-center justify-center min-w-[48px] h-12
              transition-all duration-200 transform backdrop-blur-md
              ${message.trim() && !disabled
                ? 'bg-gradient-to-r from-orange-400/80 to-orange-500/80 hover:from-orange-500/90 hover:to-orange-600/90 hover:scale-110 shadow-lg hover:shadow-orange-500/25 border border-orange-300/30'
                : 'bg-white/10 cursor-not-allowed opacity-50 border border-white/20'
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

        {/* Input hints with glassmorphism styling */}
        <div className="flex justify-between items-center mt-3 text-xs text-white/50">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {disabled && <span className="text-orange-300/80 bg-orange-500/20 px-2 py-1 rounded-lg backdrop-blur-sm">Chat not available</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;