import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { Send } from 'lucide-react';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { AuthContext } from '../context/AuthContext';

const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  selectedChatId,
  isMobile,
  // user,
  otherUser
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const {user} = useContext(AuthContext)
  const userId = user.id
  const otherUserId = otherUser._id

  // console.log(otherUser);
  
  
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
      {/* Typing Indicator with conditional glassmorphism */}
      {otherUserTyping && (
        <div className={`mb-3 px-4 py-2 ${
          isMobile 
            ? 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg' 
            : 'bg-gray-100 rounded-lg border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className={`text-sm ${isMobile ? 'text-white/80' : 'text-gray-600'}`}>Typing...</span>
          </div>
        </div>
      )}

      {/* Input Container with conditional glassmorphism */}
      <div className={`p-4 ${
        isMobile 
          ? 'bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl' 
          : 'bg-gray-900 rounded-lg border border-gray-700 shadow-sm'
      }`}>
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
              className={`w-full px-4 py-3 border transition-all duration-200 resize-none scrollbar-hidden ${
                isMobile
                  ? 'bg-white/10 border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 backdrop-blur-md'
                  : 'bg-gray-900 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
              }`}
              disabled={disabled}
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {message.length > 400 && (
              <div className={`absolute -top-6 right-2 text-xs px-2 py-1 rounded-lg ${
                isMobile 
                  ? 'text-white/60 bg-white/10 backdrop-blur-md' 
                  : 'text-white bg-gray-100'
              }`}>
                {message.length}/500
              </div>
            )}
          </div>

          {/* Send Button with conditional glassmorphism */}
          <button
            onClick={handleSend}
            className={`
              px-4 py-3 flex items-center justify-center min-w-[48px] h-12
              transition-all duration-200 transform
              ${isMobile ? 'rounded-2xl backdrop-blur-md' : 'rounded-lg'}
              ${message.trim() && !disabled
                ? isMobile
                  ? 'bg-gradient-to-r from-orange-400/80 to-orange-500/80 hover:from-orange-500/90 hover:to-orange-600/90 hover:scale-110 shadow-lg hover:shadow-orange-500/25 border border-orange-300/30'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg border border-orange-500'
                : isMobile
                  ? 'bg-white/10 cursor-not-allowed opacity-50 border border-white/20'
                  : 'bg-white cursor-not-allowed opacity-50 border border-gray-200'
              }
            `}
            disabled={!message.trim() || disabled}
            aria-label="Send message"
          >
            <Send 
              size={18} 
              className={`${
                isMobile ? 'text-white' : 'text-white'
              } ${message.trim() && !disabled ? 'animate-pulse' : ''}`}
            />
          </button>
        </div>

    
      </div>
    </div>
  );
};

export default MessageInput;