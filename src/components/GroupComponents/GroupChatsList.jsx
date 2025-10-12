import React from 'react';
import { Users} from 'lucide-react';
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
      <div className="rounded-lg shadow-lg h-full flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-white">Your Groups</h2>
          <button 
            onClick={onCreateGroup}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <span>Create Group</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {groupChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="mb-6 relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-400 to-orange-600">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No groups yet</h3>
              <p className="text-gray-400 mb-6">Create your first group to start collaborating!</p>
              <button
                onClick={onCreateGroup}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 font-semibold shadow-lg"
              >
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
        scrollbar-color: #f97316 #374151;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 10px;
        margin: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #f97316, #ea580c);
        border-radius: 10px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #ea580c, #dc2626);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 8px rgba(249, 115, 22, 0.4);
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:active {
        background: linear-gradient(45deg, #dc2626, #b91c1c);
      }

      .custom-scrollbar::-webkit-scrollbar-corner {
        background: #374151;
      }

      /* For better visibility, add glow effect on scroll */
      .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 6px rgba(249, 115, 22, 0.3);
      }
    `}</style>
    </div>
  );
};

export default GroupChatsList;