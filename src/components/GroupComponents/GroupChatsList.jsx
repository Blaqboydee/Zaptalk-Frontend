import React from 'react';
import { Users, Plus } from 'lucide-react';
import GroupChatItem from './GroupChatItem';

const GroupChatsList = ({ 
  groupChats, 
  selectedGroup, 
  onSelectGroup, 
  onCreateGroup, 
  allMessages, 
  formatTime,
  isMobile,
  isOffcanvasOpen 
}) => {
  if (isMobile && isOffcanvasOpen) return null;

  return (
    <div className={`${isMobile ? "w-full" : "w-[30%]"} h-[80vh]`}>
      <div 
        className="rounded-lg shadow-lg h-full flex flex-col"
        style={{ 
          backgroundColor: '#1A1625',
          border: '1px solid #2D2640'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid #2D2640' }}
        >
          <h2 className="font-semibold text-white">Your Groups</h2>
          <button 
            onClick={onCreateGroup}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#8B5CF6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
          >
            <Plus size={18} />
            <span>Create</span>
          </button>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {groupChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="mb-6 relative">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div 
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: '#22D3EE',
                    animationDelay: '200ms'
                  }}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No groups yet</h3>
              <p className="mb-6" style={{ color: '#A1A1AA' }}>
                Create your first group to start collaborating!
              </p>
              <button
                onClick={onCreateGroup}
                className="text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 font-semibold shadow-lg flex items-center gap-2"
                style={{ backgroundColor: '#8B5CF6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
              >
                <Plus size={20} />
                Create Group
              </button>
            </div>
          ) : (
            groupChats.map((group) => (
              <GroupChatItem
                key={group._id}
                group={group}
                isSelected={selectedGroup?._id === group._id}
                onSelect={onSelectGroup}
                allMessages={allMessages}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      </div>
    
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8B5CF6 #252032;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #252032;
          border-radius: 10px;
          margin: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #8B5CF6, #7C3AED);
          border-radius: 10px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #7C3AED, #6D28D9);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 8px rgba(139, 92, 246, 0.4);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(45deg, #6D28D9, #5B21B6);
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #252032;
        }

        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 6px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default GroupChatsList;