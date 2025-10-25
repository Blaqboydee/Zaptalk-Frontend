import React from 'react';
import { Users } from 'lucide-react';

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
      className="p-4 rounded-xl cursor-pointer transition-all duration-200 group"
      style={{
        backgroundColor: isSelected ? '#252032' : '#1A1625',
        border: `1px solid ${isSelected ? '#8B5CF6' : '#2D2640'}`,
        transform: isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#8B5CF6';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#2D2640';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Header with icon and name */}
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: '#8B5CF6' }}
        >
          <Users size={20} className="text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-sm transition-colors duration-200 truncate"
            style={{ color: isSelected ? '#22D3EE' : '#FFFFFF' }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.color = '#22D3EE';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
          >
            {group.name || 'Unnamed Group'}
          </h3>
          <span 
            className="text-[11px]"
            style={{ color: '#71717A' }}
          >
            {group.users?.length || 0} members
          </span>
        </div>
      </div>

      {/* Last message */}
      <p 
        className="text-[13px] truncate mb-2 ml-[52px]"
        style={{ color: '#A1A1AA' }}
      >
        {getLastMessage()}
      </p>

      {/* Footer with timestamp */}
      <div className="flex justify-between items-center ml-[52px]">
        <span 
          className="text-[11px]"
          style={{ color: '#71717A' }}
        >
          {formatTime(group.updatedAt)}
        </span>
        
        {/* Active indicator */}
        {isSelected && (
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#22D3EE' }}
          />
        )}
      </div>
    </div>
  );
};

export default GroupChatItem;