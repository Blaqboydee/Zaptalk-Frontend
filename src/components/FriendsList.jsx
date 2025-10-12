import React, {useContext, useState, useRef} from "react";
import { useFriends } from "../hooks/useFriends.js";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FriendsList = ({initChat }) => {
const {friends, removeFriend} = useFriends()
const {user: {id}} = useContext(AuthContext)
const [longPressedId, setLongPressedId] = useState(null)
const longPressTimer = useRef(null)

// Long press handlers
const handleTouchStart = (friendId) => {
  longPressTimer.current = setTimeout(() => {
    setLongPressedId(friendId)
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, 500) // 500ms for long press
}

const handleTouchEnd = () => {
  if (longPressTimer.current) {
    clearTimeout(longPressTimer.current)
  }
}

const handleTouchCancel = () => {
  if (longPressTimer.current) {
    clearTimeout(longPressTimer.current)
  }
}

return(
    <div className="border-b border-gray-700 rounded-lg">
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-bold mt-3 text-transparent bg-clip-text bg-orange-400 ">
          Friends ({friends.length})
        </p>
      </div>
      
      <div className="overflow-x-auto w-full custom-scrollbar p-0">
        <div className="flex gap-4 min-w-max ">
          {[...friends].reverse().map((friend, index) => (
            <div 
              key={friend._id}
              className={`group relative flex-shrink-0 rounded-2xl border transition-all duration-500 backdrop-blur-sm ${
                longPressedId === friend._id 
                  ? 'border-red-500/60 shadow-2xl shadow-red-500/20 scale-105' 
                  : 'border-gray-600/30 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/20'
              }`}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Main Friend Button */}
              <button
                className="relative flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-600/5 transition-all duration-300 group-hover:scale-[1.02] transform select-none"
                onClick={() => longPressedId !== friend._id && initChat(friend)}
                onTouchStart={() => handleTouchStart(friend._id)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                onMouseDown={() => handleTouchStart(friend._id)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
              >
                {/* Avatar with status indicator */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden ring-2 ring-orange-500/20 group-hover:ring-orange-400/40 transition-all duration-300 shadow-lg">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">
                        {friend.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  {/* Online status dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors duration-300 truncate max-w-[120px]">
                    {friend.name || "Unknown User"}
                  </span>
                  <span className="text-gray-400 text-xs group-hover:text-orange-400/80 transition-colors duration-300">
                    Click to chat
                  </span>
                </div>

                {/* Animated glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              </button>

              {/* Stylish Remove Button - Desktop hover + Mobile long press */}
              <div className={`absolute -top-2 -right-2 transition-all duration-300 transform ${
                longPressedId === friend._id 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
              }`}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFriend(friend._id)
                    setLongPressedId(null)
                  }} 
                  className="relative w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg hover:shadow-red-500/30 transition-all duration-300 ring-2 ring-gray-800 hover:ring-red-400/50 group-hover:rotate-90 transform z-10"
                  title="Remove Friend"
                >
                  <span className="text-xs">×</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div>
                </button>
              </div>

              {/* Mobile long press indicator */}
              {longPressedId === friend._id && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg animate-pulse">
                  Tap × to remove
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                </div>
              )}

              {/* Long press progress indicator for mobile */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none">
                <div 
                  className={`absolute inset-0 rounded-2xl bg-red-500/10 transition-all duration-500 ${
                    longPressedId === friend._id ? 'opacity-100' : 'opacity-0'
                  }`}
                ></div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-orange-400/30 to-orange-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
            </div>
          ))}
          
          {/* Empty state */}
          {friends.length === 0 && (
            <div className="flex items-center justify-center w-full h-full min-w-[300px]">
              <div className="text-center text-gray-400">
                {/* <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div> */}
                <p className="text-sm">No friends yet</p>
                <p className="text-xs text-gray-500">Add some friends to get started!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <style jsx>{`
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #f97316 #1f2937;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: linear-gradient(90deg, #1f2937, #374151, #1f2937);
        border-radius: 10px;
        margin: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #f97316, #ea580c, #dc2626);
        border-radius: 10px;
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          0 0 10px rgba(249, 115, 22, 0.3);
        transition: all 0.3s ease;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #ea580c, #dc2626, #b91c1c);
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          0 0 15px rgba(249, 115, 22, 0.5),
          0 0 25px rgba(249, 115, 22, 0.2);
        transform: scale(1.1);
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:active {
        background: linear-gradient(45deg, #dc2626, #b91c1c, #991b1b);
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          0 0 20px rgba(220, 38, 38, 0.6);
      }

      .custom-scrollbar::-webkit-scrollbar-corner {
        background: #1f2937;
      }

      /* Enhanced glow effects */
      .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.25),
          0 0 12px rgba(249, 115, 22, 0.4),
          0 0 20px rgba(249, 115, 22, 0.2);
      }

      /* Shimmer effect for loading */
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      .shimmer {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(249, 115, 22, 0.1),
          transparent
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
    `}</style>
  </div>
)};

export default FriendsList;