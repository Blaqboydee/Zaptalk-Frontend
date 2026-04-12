import React, { useState } from 'react';
import { EyeOff, Reply, CornerUpRight } from 'lucide-react';

const MessageItem = ({ message, user, formatTime, ownAvatar, onAvatarClick, onReply }) => {
  const [hovered, setHovered] = useState(false);
  const isAnonymous = message.isAnonymous && message.senderId?._id === 'anonymous';
  const isOwnAnonymous = message._isOwnAnonymous;
  const isOwnMessage = isOwnAnonymous || (message.senderId?._id === user.id || message.senderId === user.id);

  const senderName = isAnonymous
    ? (message.anonymousAlias || message.senderId?.name || 'Anonymous Ember 🔥')
    : isOwnAnonymous
      ? `You (anonymous)`
      : typeof message.senderId === 'object'
        ? message.senderId?.name
        : (isOwnMessage ? user.name : 'Unknown');

  const senderAvatar = (isAnonymous || isOwnAnonymous)
    ? null
    : isOwnMessage
      ? ownAvatar
      : (typeof message.senderId === 'object' ? message.senderId?.avatar : null);

  const handleAvatarClick = () => {
    if (!onAvatarClick || isAnonymous) return;
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        onClick={handleAvatarClick}
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: (isAnonymous || isOwnAnonymous)
            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
            : isOwnMessage ? 'var(--gradient-primary)' : 'var(--gradient-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 12,
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: (isAnonymous || isOwnAnonymous)
            ? 'var(--shadow-violet)'
            : isOwnMessage ? 'var(--shadow-fire)' : 'var(--shadow-sm)',
          cursor: (onAvatarClick && !isAnonymous) ? 'pointer' : 'default',
          transition: 'transform 150ms var(--ease-out)',
        }}
        onMouseEnter={(e) => { if (onAvatarClick && !isAnonymous) e.currentTarget.style.transform = 'scale(1.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {(isAnonymous || isOwnAnonymous)
          ? <EyeOff size={14} color="#fff" />
          : senderAvatar
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
          position: 'relative',
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
          <span style={{
            color: (isAnonymous || isOwnAnonymous) ? '#A78BFA' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 12,
            fontStyle: (isAnonymous || isOwnAnonymous) ? 'italic' : 'normal',
          }}>
            {senderName}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {formatTime(message.createdAt)}
          </span>
          {message.pending && (
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontStyle: 'italic' }}>
              sending…
            </span>
          )}
        </div>

        {/* Reply banner — shows which message this is replying to */}
        {message.replyTo && (
          <div className="reply-banner" style={{ alignSelf: isOwnMessage ? 'flex-end' : 'flex-start' }}>
            <CornerUpRight size={11} style={{ flexShrink: 0, color: 'var(--ember-violet)', marginTop: 1 }} />
            <div style={{ minWidth: 0 }}>
              <span className="reply-banner-name">
                {message.replyTo.isAnonymous
                  ? (message.replyTo.anonymousAlias || 'Anonymous')
                  : (message.replyTo.senderId?.name || 'Unknown')}
              </span>
              <span className="reply-banner-text">{message.replyTo.content}</span>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div
          className={(isAnonymous || isOwnAnonymous) ? 'bubble-anonymous' : isOwnMessage ? 'bubble-sent' : 'bubble-received'}
          style={{ opacity: message.pending ? 0.6 : 1 }}
        >
          <MessageContent content={message.content} mentions={message.mentions} />
        </div>

        {/* Hover reply button */}
        {onReply && hovered && !message.pending && (
          <button
            onClick={() => onReply(message)}
            className="reply-hover-btn"
            style={{
              position: 'absolute',
              top: 0,
              [isOwnMessage ? 'left' : 'right']: -32,
            }}
            title="Reply"
          >
            <Reply size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

/* Render message content with @mention highlights */
const MessageContent = ({ content, mentions }) => {
  if (!mentions || mentions.length === 0) {
    return <>{content}</>;
  }

  const mentionNames = mentions.map(m => m.name).filter(Boolean);
  if (mentionNames.length === 0) return <>{content}</>;

  // Build regex to match all @name patterns
  const escaped = mentionNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(@(?:${escaped.join('|')}))`, 'gi');
  const parts = content.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (regex.test('') || false) return part; // reset regex
        const isMention = mentionNames.some(n => part.toLowerCase() === `@${n.toLowerCase()}`);
        return isMention
          ? <span key={i} className="mention-highlight">{part}</span>
          : <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default MessageItem;