import React from "react";

const FriendsList = ({ allNewFriends, initChat }) => (
  <div className="pl-2 pr-2 border-b border-gray-700 round backdrop-blur-md">
    <div className="max-w-7xl sm:px-4">
      <h3 className="text-md font-semibold mt-3 mb-2 text-white">Friends</h3>
      <div className="overflow-x-auto h-[70px] w-[100%] custom-scrollbar">
        <div className="flex gap-3 max-w-[300px]">
          {allNewFriends.map((friend) => (
            <button
              key={friend.otherUserId || friend.otherUserName}
              className="group relative flex items-center gap-3 px-4 py-2 bg-gray-900 hover:bg-gray-600/70 rounded-xl border border-gray-600/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 flex-shrink-0"
              onClick={() => {
                console.log(friend);
                initChat(friend);
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
                  {friend.otherUserAvatar ? (
                    <img
                      src={friend.otherUserAvatar}
                      alt={friend.otherUserName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    friend.otherUserName.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-medium text-sm group-hover:text-orange-300 transition-colors">
                  {friend.otherUserName || "Unknown User"}
                </span>
                <span className="text-gray-400 text-xs">Click to chat</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
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
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3),
          0 0 8px rgba(249, 115, 22, 0.4);
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:active {
        background: linear-gradient(45deg, #dc2626, #b91c1c);
      }

      .custom-scrollbar::-webkit-scrollbar-corner {
        background: #374151;
      }

      /* For better visibility, add glow effect on scroll */
      .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2),
          0 0 6px rgba(249, 115, 22, 0.3);
      }
    `}</style>
  </div>
);

export default FriendsList;
