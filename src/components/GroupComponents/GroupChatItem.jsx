import React from 'react';

const GroupChatItem = ({ group, isSelected, onSelect, allMessages, formatTime }) => {
  console.log(group);
  const getLastMessage = () => {
    const groupMessages = allMessages?.filter((message) => message.chatId === group._id) || [];
    return groupMessages.length > 0 
      ? groupMessages[groupMessages.length - 1]?.content || 'No messages yet'
      : 'No messages yet';
  };

  return (
    <div 
      onClick={() => onSelect(group)}
      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-1 group ${
        isSelected 
          ? 'bg-gray-700 border-orange-500/50 shadow-lg shadow-orange-500/10' 
          : 'bg-gray-800 border-gray-700 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-sm transition-colors ${
          isSelected ? 'text-orange-300' : 'text-white group-hover:text-orange-300'
        }`}>
          {group.name || 'Unnamed Group'}
        </h3>
      </div>
        <p className="text-[13px] text-gray-400 truncate mb-3">
        {getLastMessage()}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-gray-500">{formatTime(group.updatedAt)}</span>
      </div>
    </div>
  );
};

export default GroupChatItem;