import React from 'react';

const MessageItem = ({ message, user, formatTime }) => {
  const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
  const senderName = typeof message.senderId === 'object' 
    ? message.senderId?.name 
    : (isOwnMessage ? user.name : 'Unknown');

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 shadow-lg">
        {senderName?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span className="font-semibold text-white text-sm">
            {senderName}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div className={`rounded-lg p-3 max-w-xs ${
          isOwnMessage 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 ml-auto' 
            : 'bg-gray-700'
        }`}>
          <p className="text-white text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;