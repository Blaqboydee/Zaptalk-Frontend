import React, { useState, useEffect } from "react";
import { formatTime } from "../../utils/formatTime.js";
import { useGlobalSocket } from "../../context/SocketContext.jsx";
import { useFriends } from "../../hooks/useFriends.js";

const ChatListItem = ({ chats, chat, user, allMessages, openChat, messageData, chatToUpdate }) => {
  const secondUser = chat.users?.find((u) => u._id !== user.id);
  const { friends } = useFriends();
  const liveFriend = friends.find((f) => f._id === secondUser?._id);
  const isOnline = liveFriend?.status?.state === "online";
  const [isDotVisible, setIsDotVisible] = useState(true);

  const { newMessage } = useGlobalSocket();

  const filteredMessages = allMessages?.filter((m) => m.chatId === chat._id) || [];
  const lastMessage = filteredMessages[filteredMessages.length - 1] || chat.lastMessage;

  const messageToChange = allMessages?.filter((m) => m.chatId === chat._id) || [];
  const messageToPrint =
    newMessage && newMessage.chatId === chat._id
      ? [...messageToChange, newMessage]
      : messageToChange;

  const latestMessage = messageToPrint[messageToPrint.length - 1]?.content;

  const getDisplayMessage = () => {
    if (messageData && messageData.chatId === chat._id) {
      if (messageData.senderId._id === user.id || messageData.sender === user.id) {
        return messageData.content;
      }
      return latestMessage;
    }
    return latestMessage || lastMessage?.content;
  };

  const displayMessage = getDisplayMessage();

  const findLatestMessageChat = () => {
    let latestChatId = null;
    let latestTimestamp = 0;
    chats?.forEach((chatItem) => {
      const chatMessages = allMessages?.filter((msg) => msg.chatId === chatItem._id) || [];
      const messagesWithNew =
        newMessage && newMessage.chatId === chatItem._id
          ? [...chatMessages, newMessage]
          : chatMessages;
      if (messagesWithNew.length > 0) {
        const lastMsg = messagesWithNew[messagesWithNew.length - 1];
        const timestamp = new Date(lastMsg.createdAt).getTime();
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestChatId = chatItem._id;
        }
      }
    });
    return latestChatId;
  };

  const hasLatestMessage = findLatestMessageChat() === chat._id;

  useEffect(() => {
    if (hasLatestMessage && newMessage && newMessage.chatId === chat._id) {
      setIsDotVisible(true);
    }
  }, [hasLatestMessage, newMessage, chat._id]);

  const handleChatClick = () => {
    setIsDotVisible(false);
    openChat(chat);
  };

  const handleDotClick = (e) => {
    e.stopPropagation();
    setIsDotVisible(!isDotVisible);
  };

  const initials = secondUser?.name?.charAt(0)?.toUpperCase() ?? "U";
  const chatName =
    chat.users?.length === 2 ? secondUser?.name || "Private Chat" : chat.name || "Group Chat";

  return (
    <div
      onClick={handleChatClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        cursor: 'pointer',
        transition: 'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)';
        e.currentTarget.style.borderColor = 'var(--border-fire)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-secondary)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--gradient-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 16,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {secondUser?.avatar ? (
            <img
              src={secondUser.avatar}
              alt={secondUser.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : initials}
        </div>

        {/* Online dot */}
        {isOnline && (
          <span
            className="online-dot"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              border: '2px solid var(--bg-secondary)',
            }}
          />
        )}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + time row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '65%',
            }}
          >
            {chatName}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
            {lastMessage ? formatTime(lastMessage.createdAt) : ''}
          </span>
        </div>

        {/* Preview + unread badge row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <p
            className="line-clamp-1"
            style={{
              color: 'var(--text-tertiary)',
              fontSize: 12,
              fontWeight: 500,
              flex: 1,
              minWidth: 0,
            }}
          >
            {displayMessage
              ? displayMessage.length > 40
                ? displayMessage.slice(0, 40) + '…'
                : displayMessage
              : 'No messages yet'}
          </p>

          {/* Unread indicator */}
          {hasLatestMessage && isDotVisible && (
            <span
              onClick={handleDotClick}
              className="badge-fire"
              style={{ cursor: 'pointer', flexShrink: 0 }}
              title="Mark as read"
            >
              new
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;