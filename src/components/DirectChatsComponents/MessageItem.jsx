import React from 'react';

const MessageItem = ({ message, user, formatTime }) => {
  const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
  const senderName = typeof message.senderId === 'object' 
    ? message.senderId?.name 
    : (isOwnMessage ? user.name : 'Unknown');

  return (
    <div className={`flex gap-3 animate-fade-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg transition-transform duration-200 hover:scale-110"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        {senderName?.charAt(0)?.toUpperCase() || '?'}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Sender Info */}
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span 
            className="font-semibold text-sm transition-colors duration-200"
            style={{ color: '#FFFFFF' }}
          >
            {senderName}
          </span>
          <span 
            className="text-xs"
            style={{ color: '#71717A' }}
          >
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message Bubble */}
        <div 
          className={`rounded-xl p-3 max-w-xs shadow-md transition-all duration-200 hover:scale-[1.01] ${
            isOwnMessage ? 'ml-auto' : 'mr-auto'
          }`}
          style={{
            backgroundColor: isOwnMessage ? '#8B5CF6' : '#252032',
            border: `1px solid ${isOwnMessage ? '#7C3AED' : '#2D2640'}`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = isOwnMessage 
              ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <p className="text-white text-sm break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;