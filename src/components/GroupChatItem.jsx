import React from 'react';

const GroupChatItem = ({ group, isSelected, onSelect, allMessages, formatTime }) => {
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
        <h3 className={`font-semibold transition-colors ${
          isSelected ? 'text-orange-300' : 'text-white group-hover:text-orange-300'
        }`}>
          {group.name}
        </h3>
        {group.unreadCount > 0 && (
          <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {group.unreadCount}
          </span>
        )}
      </div>
        <p className="text-sm text-gray-400 truncate mb-3">
        {getLastMessage()}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{formatTime(group.updatedAt)}</span>
        <div className="flex -space-x-2">
          {group.users?.slice(0, 3).map((participant) => (
            <div 
              key={participant._id}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white shadow-lg"
            >
              <span>{participant.name?.[0] || participant._id?.[0] || '?'}</span>
            </div>
          ))}
          {(group.users?.length || 0) > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-white">
              +{group.users.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChatItem;