import React, { useState } from 'react';
import { Send } from 'lucide-react';

const GroupMessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 disabled:opacity-50"
        style={{
          backgroundColor: '#252032',
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
      <button 
        onClick={handleSubmit}
        className="text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
        style={{
          backgroundColor: !message.trim() || disabled ? '#6D28D9' : '#8B5CF6'
        }}
        onMouseEnter={(e) => {
          if (message.trim() && !disabled) {
            e.currentTarget.style.backgroundColor = '#7C3AED';
          }
        }}
        onMouseLeave={(e) => {
          if (message.trim() && !disabled) {
            e.currentTarget.style.backgroundColor = '#8B5CF6';
          }
        }}
        disabled={!message.trim() || disabled}
      >
        <Send size={18} className={message.trim() && !disabled ? 'animate-pulse' : ''} />
      </button>
    </div>
  );
};

export default GroupMessageInput;