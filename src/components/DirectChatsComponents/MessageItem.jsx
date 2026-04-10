import React from 'react';

const MessageItem = ({ message, user, formatTime, ownAvatar, onAvatarClick }) => {
  const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
  const senderName = typeof message.senderId === 'object'
    ? message.senderId?.name
    : (isOwnMessage ? user.name : 'Unknown');
  const senderAvatar = isOwnMessage
    ? ownAvatar
    : (typeof message.senderId === 'object' ? message.senderId?.avatar : null);

  const handleAvatarClick = () => {
    if (!onAvatarClick) return;
    const senderData = isOwnMessage
      ? { _id: user.id, name: user.name, email: user.email, avatar: ownAvatar }
      : (typeof message.senderId === 'object'
          ? message.senderId
          : { _id: message.senderId, name: senderName, avatar: senderAvatar });
    onAvatarClick(senderData);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        gap: 10,
        alignItems: 'flex-end',
        padding: '2px 0',
      }}
    >
      {/* Avatar */}
      <div
        onClick={handleAvatarClick}
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: isOwnMessage ? 'var(--gradient-primary)' : 'var(--gradient-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 12,
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: isOwnMessage ? 'var(--shadow-fire)' : 'var(--shadow-sm)',
          cursor: onAvatarClick ? 'pointer' : 'default',
          transition: 'transform 150ms var(--ease-out)',
        }}
        onMouseEnter={(e) => { if (onAvatarClick) e.currentTarget.style.transform = 'scale(1.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {senderAvatar
          ? <img src={senderAvatar} alt={senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : senderName?.charAt(0)?.toUpperCase() ?? '?'
        }
      </div>

      {/* Bubble + meta */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
          gap: 4,
          maxWidth: '75%',
        }}
      >
        {/* Sender name + time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 12 }}>
            {senderName}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {formatTime(message.createdAt)}
          </span>
          {/* Pending indicator */}
          {message.pending && (
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontStyle: 'italic' }}>
              sending…
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={isOwnMessage ? 'bubble-sent' : 'bubble-received'}
          style={{ opacity: message.pending ? 0.6 : 1 }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;