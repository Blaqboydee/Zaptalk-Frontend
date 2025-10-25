import React, { useContext, useState, useRef } from "react";
import { useFriends } from "../hooks/useFriends.js";
import { AuthContext } from "../context/AuthContext";
import { X, UserX } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FriendsList = ({ initChat }) => {
  const { friends, removeFriend } = useFriends();
  const { user: { id } } = useContext(AuthContext);
  const [longPressedId, setLongPressedId] = useState(null);
  const longPressTimer = useRef(null);

  // Long press handlers
  const handleTouchStart = (friendId) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedId(friendId);
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div 
      className="rounded-lg"
      style={{ borderBottom: '1px solid #2D2640' }}
    >
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-3">
          <p 
            className="text-base font-bold mt-3"
            style={{ color: '#8B5CF6' }}
          >
            Friends ({friends.length})
          </p>
        </div>
        
        <div className="overflow-x-auto w-full custom-scrollbar p-0">
          <div className="flex gap-4 min-w-max">
            {[...friends].reverse().map((friend, index) => (
              <div 
                key={friend._id}
                className="group relative flex-shrink-0 rounded-2xl transition-all duration-500 backdrop-blur-sm"
                style={{
                  border: longPressedId === friend._id 
                    ? '1px solid rgba(239, 68, 68, 0.6)' 
                    : '1px solid #2D2640',
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                  boxShadow: longPressedId === friend._id 
                    ? '0 0 20px rgba(239, 68, 68, 0.2)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (longPressedId !== friend._id) {
                    e.currentTarget.style.borderColor = '#8B5CF6';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (longPressedId !== friend._id) {
                    e.currentTarget.style.borderColor = '#2D2640';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Main Friend Button */}
                <button
                  className="relative flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-300 group-hover:scale-[1.02] transform select-none"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ring-2 transition-all duration-300 shadow-lg"
                      style={{ 
                        backgroundColor: '#8B5CF6',
                        ringColor: 'rgba(139, 92, 246, 0.2)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.ringColor = 'rgba(139, 92, 246, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.ringColor = 'rgba(139, 92, 246, 0.2)'}
                    >
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
                    {friend.status?.state === "online" && (
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: '#10B981',
                          border: '2px solid #1A1625'
                        }}
                      />
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col items-start min-w-0">
                    <span 
                      className="font-semibold text-sm transition-colors duration-300 truncate max-w-[120px]"
                      style={{ color: '#FFFFFF' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#22D3EE'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
                    >
                      {friend.name || "Unknown User"}
                    </span>
                    <span 
                      className="text-xs transition-colors duration-300"
                      style={{ color: '#71717A' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#8B5CF6'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#71717A'}
                    >
                      Click to chat
                    </span>
                  </div>

                  {/* Animated glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.05), transparent)' }}
                  />
                </button>

                {/* Remove Button - Desktop hover + Mobile long press */}
                <div className={`absolute -top-2 -right-2 transition-all duration-300 transform ${
                  longPressedId === friend._id 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
                }`}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFriend(friend._id);
                      setLongPressedId(null);
                    }} 
                    className="relative w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ring-2 group-hover:rotate-90 transform z-10"
                    style={{
                      backgroundColor: '#EF4444',
                      ringColor: '#1A1625'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#DC2626';
                      e.currentTarget.style.ringColor = 'rgba(239, 68, 68, 0.5)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF4444';
                      e.currentTarget.style.ringColor = '#1A1625';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    title="Remove Friend"
                  >
                    <X size={16} />
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))' }}
                    />
                  </button>
                </div>

                {/* Mobile long press indicator */}
                {longPressedId === friend._id && (
                  <div 
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded-lg shadow-lg animate-pulse"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    Tap × to remove
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{ backgroundColor: '#EF4444' }}
                    />
                  </div>
                )}

                {/* Long press progress indicator */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <div 
                    className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                      longPressedId === friend._id ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  />
                </div>

                {/* Decorative corner accent */}
                <div 
                  className="absolute top-1 right-1 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"
                  style={{ background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.3), rgba(34, 211, 238, 0.3))' }}
                />
              </div>
            ))}
            
            {/* Empty state */}
            {friends.length === 0 && (
              <div className="flex items-center justify-center w-full h-full min-w-[300px]">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#252032' }}
                  >
                    <UserX size={24} style={{ color: '#71717A' }} />
                  </div>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    No friends yet
                  </p>
                  <p className="text-xs" style={{ color: '#71717A' }}>
                    Add some friends to get started!
                  </p>
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
          scrollbar-color: #8B5CF6 #1A1625;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(90deg, #1A1625, #252032, #1A1625);
          border-radius: 10px;
          margin: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #8B5CF6, #7C3AED, #6D28D9);
          border-radius: 10px;
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 10px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #7C3AED, #6D28D9, #5B21B6);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 0 15px rgba(139, 92, 246, 0.5),
            0 0 25px rgba(139, 92, 246, 0.2);
          transform: scale(1.1);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(45deg, #6D28D9, #5B21B6, #4C1D95);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            0 0 20px rgba(109, 40, 217, 0.6);
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1A1625;
        }

        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            0 0 12px rgba(139, 92, 246, 0.4),
            0 0 20px rgba(139, 92, 246, 0.2);
        }

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
            rgba(139, 92, 246, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default FriendsList;