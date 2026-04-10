import React, { useState } from 'react';
import MessageItem from './MessageItem';
import { Flame } from 'lucide-react';
import UserProfileDrawer from '../UserProfileDrawer';

const ChatMessagesArea = ({
  messages,
  isLoadingMessages,
  messagesEndRef,
  user,
  formatTime,
  ownAvatar,
}) => {
  const [drawerUser, setDrawerUser] = useState(null);

  if (isLoadingMessages) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '48px 24px',
        }}
      >
        {/* Skeleton bubbles */}
        {[70, 50, 85, 40].map((width, i) => {
          const isSent = i % 2 === 1;
          return (
            <div
              key={i}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                animation: `emberPulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div
                style={{
                  height: 38,
                  width: `${width}%`,
                  maxWidth: '75%',
                  borderRadius: isSent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: isSent ? 'var(--bg-active)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-fire)',
            marginBottom: 4,
          }}
        >
          <Flame size={24} color="#fff" strokeWidth={1.5} />
        </div>
        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>
          No messages yet
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Send the first message to get the conversation going 🔥
        </p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          user={user}
          formatTime={formatTime}
          ownAvatar={ownAvatar}
          onAvatarClick={setDrawerUser}
        />
      ))}
      <div ref={messagesEndRef} />
      {drawerUser && (
        <UserProfileDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}
    </>
  );
};

export default ChatMessagesArea;