import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Plus,
  MessageCircle,
  Search,
  MoreVertical,
  Phone,
  Video,
  Zap,
  Flame,
} from "lucide-react";

import ping from '../assets/ping.wav';

// Import custom hooks
import { useSocket } from "../hooks/useSocket";
import { useChats } from "../hooks/useChats";
import { useMessages } from "../hooks/useMessages";
import { useChatInitialization } from "../hooks/useChatInitialization";
import { useResponsive } from "../hooks/useResponsive";
import { useGlobalSocket } from "../context/SocketContext";
import useSound from 'use-sound';

// Import components
import ChatListItem from "../components/DirectChatsComponents/ChatListItems";
import ChatMessages from "../components/DirectChatsComponents/ChatMessages";
import FriendsList from "../components/FriendsList";
import MessageInput from "../components/DirectChatsComponents/MessageInput";
import MobileChatModal from "../components/DirectChatsComponents/MobileChatModal";

export default function ChatsPage() {
  const { user, allMessages } = useOutletContext();
  const { profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const { socket, setIsChatOpen, newMessage, registerChatUpdateCallback } = useGlobalSocket();
  const [playPing] = useSound(ping);

  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const { isMobile } = useResponsive();
  const {
    chats, addChat, handleSearch, searchTerm,
    filteredChats, updateChatOnMessage, isLoading,
  } = useChats(user?.id);

  const {
    messages, isLoadingMessages, messagesEndRef,
    addMessage, setMessages, editMessage, deleteMessage,
  } = useMessages(selectedChatId, user?.id);

  const handleMessageReceived = useCallback((message) => {
    if (message.senderId._id !== user.id) playPing();
    addMessage(message);
  }, [addMessage, playPing, user.id]);

  const { sendMessage: socketSendMessage, messageData } = useSocket(
    selectedChatId,
    handleMessageReceived
  );

  useEffect(() => {
    registerChatUpdateCallback(updateChatOnMessage);
  }, [registerChatUpdateCallback, updateChatOnMessage]);

  useSound(messageData);

  const { initChat } = useChatInitialization(
    user, chats, addChat, setSelectedChatId, setOtherUser,
    setMessages, isMobile, setIsOffcanvasOpen
  );

  const sendMessage = useCallback((messageContent) => {
    if (!messageContent.trim() || !selectedChatId || !user?.id) return;
    const tempMessage = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      content: messageContent,
      senderId: user.id,
      chatId: selectedChatId,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    addMessage(tempMessage);
    socketSendMessage({ content: messageContent, senderId: user.id, chatId: selectedChatId });
  }, [socketSendMessage, selectedChatId, user?.id, addMessage]);

  const openChat = useCallback((chat) => {
    setIsChatOpen(true);
    const secondUser = chat.users?.find((u) => u._id !== user.id);
    if (!secondUser) return;
    if (socket) socket.emit("join_chat", chat._id);
    setOtherUser(secondUser);
    setSelectedChatId(chat._id);
    if (isMobile) setIsOffcanvasOpen(true);
  }, [user.id, isMobile, setIsChatOpen, socket]);

  const closeOffcanvas = useCallback(() => {
    setIsChatOpen(false);
    setIsOffcanvasOpen(false);
  }, [setIsChatOpen]);

  const chatToUpdate = chats.find((c) => c._id === newMessage?.chatId);

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100dvh' }}>
        <div className="flex flex-col p-4 gap-4">

          {/* Search */}
          <div className="relative animate-fade-in">
            <Search
              size={15}
              style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={handleSearch}
              className="input-ember scrollbar-hidden"
              style={{ paddingLeft: 40 }}
            />
          </div>

          {/* List */}
          {isLoading ? (
            <LoadingState />
          ) : chats.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredChats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat} chats={chats} user={user}
                  messageData={messageData} allMessages={allMessages}
                  chatToUpdate={chatToUpdate} openChat={openChat}
                />
              ))}
            </div>
          ) : (
            <EmptyChatsState navigate={navigate} />
          )}
        </div>

        <MobileChatModal
          isOpen={isOffcanvasOpen}
          onClose={closeOffcanvas}
          selectedChatId={selectedChatId}
          otherUser={otherUser}
          messages={messages}
          user={user}
          isLoadingMessages={isLoadingMessages}
          messagesEndRef={messagesEndRef}
          onSendMessage={sendMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          isMobile={isMobile}
        />
      </div>
    );
  }

  /* ── Desktop ── */
  return (
    <div
      className="chat-area-height"
      style={{
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* ── Left Sidebar ── */}
      <div
        className="chat-sidebar"
        style={{ width: 340 }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2
              style={{
                color: 'var(--text-primary)',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              Messages
            </h2>
            <button
              className="btn-ember"
              onClick={() => navigate("/users")}
              style={{ padding: '8px 14px', fontSize: 13, borderRadius: 'var(--radius-lg)' }}
            >
              <Plus size={14} strokeWidth={2.5} />
              New
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute', left: 13, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="input-ember"
              style={{ paddingLeft: 38, fontSize: 14 }}
            />
          </div>
        </div>

        {/* Friends strip */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <FriendsList initChat={initChat} />
        </div>

        {/* Chat list */}
        <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {isLoading ? (
            <LoadingState />
          ) : filteredChats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredChats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat} chats={chats} user={user}
                  messageData={messageData} allMessages={allMessages}
                  chatToUpdate={chatToUpdate} openChat={openChat}
                />
              ))}
            </div>
          ) : (
            <EmptyChatsState navigate={navigate} />
          )}
        </div>
      </div>

      {/* ── Right: Chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-base)' }}>
        {selectedChatId && otherUser ? (
          <>
            <ChatHeader otherUser={otherUser} />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ChatMessages
                messages={messages}
                selectedChatId={selectedChatId}
                user={user}
                otherUser={otherUser}
                profile={profile}
                isLoadingMessages={isLoadingMessages}
                messagesEndRef={messagesEndRef}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <MessageInput
                onSendMessage={sendMessage}
                selectedChatId={selectedChatId}
                user={user}
                otherUser={otherUser}
              />
            </div>
          </>
        ) : (
          <WelcomeScreen navigate={navigate} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const LoadingState = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
    {[1, 0.7, 0.5].map((opacity, i) => (
      <div
        key={i}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          opacity,
          animation: 'emberPulse 2s ease-in-out infinite',
          animationDelay: `${i * 0.18}s`,
        }}
      >
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-tertiary)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 11, width: '40%', borderRadius: 'var(--radius-pill)', background: 'var(--bg-tertiary)' }} />
          <div style={{ height: 9, width: '65%', borderRadius: 'var(--radius-pill)', background: 'var(--bg-hover)' }} />
        </div>
      </div>
    ))}
  </div>
);

const EmptyChatsState = ({ navigate }) => (
  <div
    className="animate-fade-in"
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '48px 24px',
    }}
  >
    {/* Icon */}
    <div
      style={{
        width: 72, height: 72, borderRadius: 'var(--radius-xl)',
        background: 'var(--gradient-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-fire)',
        marginBottom: 20,
      }}
    >
      <MessageCircle size={32} color="#fff" />
    </div>

    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
      No conversations yet
    </p>
    <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 20, maxWidth: 220 }}>
      Find people and start your first chat
    </p>

    <button className="btn-ember" onClick={() => navigate("/users")} style={{ fontSize: 13 }}>
      <Plus size={14} />
      Find People
    </button>
  </div>
);

const ChatHeader = ({ otherUser }) => (
  <div
    style={{
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      flexShrink: 0,
    }}
  >
    {/* User info */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--gradient-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15,
            overflow: 'hidden',
          }}
        >
          {otherUser?.avatar ? (
            <img src={otherUser.avatar} alt={otherUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            otherUser?.name?.charAt(0)?.toUpperCase() ?? 'U'
          )}
        </div>
        {/* Status dot */}
        <span
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 10, height: 10, borderRadius: '50%',
            background: otherUser?.status?.state === 'online' ? 'var(--online-dot)' : 'var(--text-muted)',
            border: '2px solid var(--bg-secondary)',
          }}
        />
      </div>

      <div>
        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
          {otherUser.name ?? 'Chat'}
        </p>
        <p style={{
          fontSize: 12, fontWeight: 600,
          color: otherUser?.status?.state === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
        }}>
          {otherUser?.status?.state === 'online' ? '● Active now' : otherUser?.status?.state ?? 'Offline'}
        </p>
      </div>
    </div>

    {/* Action buttons */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[Phone, Video, MoreVertical].map((Icon, i) => (
        <button key={i} className="btn-icon">
          <Icon size={16} />
        </button>
      ))}
    </div>
  </div>
);

const WelcomeScreen = ({ navigate }) => (
  <div
    className="animate-fade-in"
    style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: 40,
    }}
  >
    {/* Orb */}
    <div
      className="animate-orb"
      style={{
        width: 100, height: 100,
        borderRadius: '50%',
        background: 'var(--gradient-full)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 60px rgba(255,87,34,0.25), 0 0 120px rgba(139,92,246,0.15)',
        marginBottom: 28,
      }}
    >
      <Flame size={40} color="#fff" strokeWidth={1.5} />
    </div>

    <h2
      style={{
        color: 'var(--text-primary)', fontWeight: 800,
        fontSize: 22, letterSpacing: '-0.03em', marginBottom: 8,
      }}
    >
      Pick up where you left off
    </h2>
    <p style={{ color: 'var(--text-tertiary)', fontSize: 14, maxWidth: 300, marginBottom: 28, lineHeight: 1.6 }}>
      Select a conversation or start a new one to get the fire going.
    </p>

    <button className="btn-ember" onClick={() => navigate("/users")}>
      <Plus size={15} />
      Start a new chat
    </button>

    {/* Feature pills */}
    <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[
        { label: 'End-to-end secure', color: 'var(--success)' },
        { label: 'Real-time', color: 'var(--text-cyan)' },
        { label: 'Lightning fast', color: 'var(--text-fire)' },
      ].map(({ label, color }) => (
        <span
          key={label}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--glass-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '5px 12px',
            fontSize: 12, fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {label}
        </span>
      ))}
    </div>
  </div>
);