import React, { useState, useRef, useContext } from "react";
import { useFriends } from "../hooks/useFriends.js";
import { AuthContext } from "../context/AuthContext";
import { X, UserX } from "lucide-react";

const FriendsList = ({ initChat }) => {
  const { friends, removeFriend } = useFriends();
  const { user: { id } } = useContext(AuthContext);
  const [longPressedId, setLongPressedId] = useState(null);
  const longPressTimer = useRef(null);

  const handleTouchStart = (friendId) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedId(friendId);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  if (friends.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <UserX size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 600 }}>No friends yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Add people to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Label */}
      <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Online · {friends.length}
      </p>

      {/* Horizontal scroll strip */}
      <div
        className="scrollbar-hidden"
        style={{ overflowX: 'auto', display: 'flex', gap: 8, paddingBottom: 4 }}
      >
        {[...friends].reverse().map((friend, index) => {
          const isLongPressed = longPressedId === friend._id;
          const isOnline = friend.status?.state === 'online';
          const initials = friend.name?.charAt(0)?.toUpperCase() ?? 'U';

          return (
            <div
              key={friend._id}
              style={{
                position: 'relative',
                flexShrink: 0,
                animation: `emberSlideInUp var(--duration-slow) var(--ease-out) ${index * 60}ms both`,
              }}
            >
              {/* Friend chip */}
              <button
                onClick={() => !isLongPressed && initChat(friend)}
                onTouchStart={() => handleTouchStart(friend._id)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={() => handleTouchStart(friend._id)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={(e) => {
                  handleTouchEnd();
                  if (!isLongPressed) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px 7px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: isLongPressed ? 'rgba(239,68,68,0.08)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isLongPressed ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  outline: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isLongPressed) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-fire)';
                  }
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--gradient-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 12,
                      overflow: 'hidden',
                    }}
                  >
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </div>
                  {isOnline && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        right: -1,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--online-dot)',
                        border: '1.5px solid var(--bg-tertiary)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {/* Name */}
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    maxWidth: 90,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {friend.name ?? 'Unknown'}
                </span>
              </button>

              {/* Remove button — appears on hover / long press */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFriend(friend._id);
                  setLongPressedId(null);
                }}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--error)',
                  border: '1.5px solid var(--bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: isLongPressed ? 1 : 0,
                  transform: isLongPressed ? 'scale(1)' : 'scale(0.6)',
                  transition: 'opacity var(--duration-fast) ease, transform var(--duration-fast) var(--ease-spring)',
                  zIndex: 10,
                }}
                className="remove-btn"
                title="Remove friend"
              >
                <X size={10} color="#fff" strokeWidth={3} />
              </button>

              {/* Long-press tooltip */}
              {isLongPressed && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--error)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 20,
                  }}
                >
                  Tap × to remove
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover reveal for remove buttons on desktop */}
      <style>{`
        .remove-btn { opacity: 0; transform: scale(0.6); }
        div:hover > .remove-btn { opacity: 1 !important; transform: scale(1) !important; }
      `}</style>
    </div>
  );
};

export default FriendsList;