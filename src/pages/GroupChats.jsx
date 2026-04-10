import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, LogOut, X, AlertTriangle, ChevronLeft, Sparkles } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import { useGroupChats } from '../hooks/useGroupChats';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useGlobalSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

import GroupChatsList from '../components/GroupComponents/GroupChatsList';
import ChatMessagesArea from '../components/DirectChatsComponents/ChatMessagesArea';
import GroupMessageInput from '../components/GroupComponents/GroupMessageInput';
import CreateGroupModal from '../components/GroupComponents/CreateGroupModal';

const GroupChats = () => {
  const { user } = useOutletContext();
  const { profile } = useAuth();
  const { friends } = useFriends();
  const { socket } = useGlobalSocket();

  const [selectedGroup, setSelectedGroup]       = useState(null);
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const { isMobile, isOffcanvasOpen, openMobileChat, closeMobileChat } = useResponsiveLayout();

  const {
    groupChats, error: groupError,
    createGroup, leaveGroup, updateChatWithMessage, refetchChats,
  } = useGroupChats(user?.id);

  const {
    messages, isLoadingMessages, messagesEndRef, sendMessage, error: messageError,
  } = useGroupMessages(selectedGroup, user, socket);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now  = new Date();
    const date = new Date(timestamp);
    return (now - date) / 36e5 < 24
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString();
  };

  useEffect(() => {
    if (messages.length > 0 && selectedGroup)
      updateChatWithMessage(messages[messages.length - 1]);
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleUserLeft = ({ groupId, userId: leftId }) => {
      if (leftId === user.id) return;
      if (selectedGroup?._id === groupId)
        setSelectedGroup((prev) => ({
          ...prev,
          users: prev.users?.filter((u) => (u._id?.toString() || u.toString()) !== leftId),
        }));
      refetchChats();
    };
    socket.on('user_left_group', handleUserLeft);
    return () => socket.off('user_left_group', handleUserLeft);
  }, [socket, selectedGroup, user.id]);

  // Fetch live online status for group members when a group is selected
  useEffect(() => {
    if (!socket || !selectedGroup?.users?.length) return;
    const memberIds = selectedGroup.users
      .map((u) => u._id?.toString())
      .filter(Boolean);
    socket.emit('get_friends_online_status', memberIds);
    const handleStatus = (statusMap) => {
      setSelectedGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users?.map((u) => ({
            ...u,
            status: {
              ...u.status,
              state: statusMap[u._id?.toString()] ? 'online' : 'offline',
            },
          })),
        };
      });
    };
    socket.once('friends_online_status', handleStatus);
    return () => socket.off('friends_online_status', handleStatus);
  }, [socket, selectedGroup?._id]);

  // Keep participant statuses live while the group is open
  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = ({ userId: updatedId, status }) => {
      setSelectedGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users?.map((u) =>
            u._id?.toString() === updatedId ? { ...u, status } : u
          ),
        };
      });
    };
    socket.on('user-status-updated', handleStatusUpdate);
    return () => socket.off('user-status-updated', handleStatusUpdate);
  }, [socket]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setShowParticipants(false);
    if (isMobile) openMobileChat();
  };

  const handleCreateGroupSubmit = async (groupName, selectedUserIds) => {
    try {
      const newGroup = await createGroup(groupName, selectedUserIds, user.id);
      setShowCreateModal(false);
      setSelectedGroup(newGroup);
    } catch (_) {}
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    try {
      await leaveGroup(selectedGroup._id, user.id);
      setSelectedGroup(null);
      setShowLeaveConfirm(false);
      closeMobileChat();
    } catch (_) {}
  };

  const handleCloseMobile = () => {
    closeMobileChat();
    if (isMobile) setSelectedGroup(null);
  };

  const error = groupError || messageError;

  return (
    <div
      className="chat-area-height flex overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Groups sidebar ── */}
      <GroupChatsList
        groupChats={groupChats}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={() => setShowCreateModal(true)}
        isMobile={isMobile}
        isOffcanvasOpen={isOffcanvasOpen}
      />

      {/* ── Desktop chat area ── */}
      {!isMobile && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {selectedGroup ? (
            <>
              {/* Chat header */}
              <ChatHeader
                group={selectedGroup}
                showParticipants={showParticipants}
                onToggleParticipants={() => setShowParticipants((p) => !p)}
                onLeave={() => setShowLeaveConfirm(true)}
              />

              {error && <ErrorBanner message={error} />}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 space-y-3">
                <ChatMessagesArea
                  messages={messages}
                  isLoadingMessages={isLoadingMessages}
                  messagesEndRef={messagesEndRef}
                  user={user}
                  formatTime={formatTime}
                  ownAvatar={profile?.avatar}
                />
              </div>

              {/* Input bar */}
              <div
                className="flex-shrink-0 p-3"
                style={{
                  background: 'var(--bg-primary)',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <GroupMessageInput onSendMessage={sendMessage} />
              </div>

              {/* Slide-in participants panel */}
              {showParticipants && (
                <ParticipantsPanel
                  group={selectedGroup}
                  onClose={() => setShowParticipants(false)}
                />
              )}
            </>
          ) : (
            <WelcomeScreen onCreateGroup={() => setShowCreateModal(true)} />
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreateModal && (
        <CreateGroupModal
          friends={friends}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroupSubmit}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmLeaveModal
          groupName={selectedGroup?.name}
          onConfirm={handleLeaveGroup}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      {/* ── Mobile full-screen modal ── */}
      {isMobile && isOffcanvasOpen && selectedGroup && (
        <MobileGroupModal
          selectedGroup={selectedGroup}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          messagesEndRef={messagesEndRef}
          user={user}
          formatTime={formatTime}
          showParticipants={showParticipants}
          onToggleParticipants={() => setShowParticipants((p) => !p)}
          onLeaveGroup={() => setShowLeaveConfirm(true)}
          onClose={handleCloseMobile}
          onSendMessage={sendMessage}
          error={error}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

/* ── Chat header (desktop) ── */
const ChatHeader = ({ group, showParticipants, onToggleParticipants, onLeave }) => (
  <div
    className="flex-shrink-0 px-5 py-3 flex items-center justify-between"
    style={{
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
    }}
  >
    <div className="flex items-center gap-3">
      {/* Group avatar */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <Users size={18} color="#fff" strokeWidth={2} />
      </div>
      <div>
        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}
        >
          {group.name}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          {group.users?.length || 0} members
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {/* Members toggle */}
      <button
        onClick={onToggleParticipants}
        className="btn-icon"
        style={
          showParticipants
            ? { background: 'var(--gradient-primary)', borderColor: 'transparent' }
            : {}
        }
        title="Members"
      >
        <Users
          size={16}
          color={showParticipants ? '#fff' : 'var(--text-secondary)'}
          strokeWidth={2}
        />
      </button>

      {/* Leave */}
      <button
        onClick={onLeave}
        className="flex items-center gap-1.5 btn-ghost"
        style={{
          padding: '8px 14px',
          fontSize: '13px',
          color: 'var(--error)',
          borderColor: 'rgba(239,68,68,0.25)',
          background: 'rgba(239,68,68,0.06)',
        }}
        title="Leave group"
      >
        <LogOut size={14} strokeWidth={2} />
        <span className="hidden md:inline">Leave</span>
      </button>
    </div>
  </div>
);

/* ── Participants slide panel ── */
const ParticipantsPanel = ({ group, onClose }) => (
  <div
    className="absolute top-0 right-0 h-full w-72 z-20 flex flex-col animate-slide-in"
    style={{
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    <div
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center gap-2">
        <Users size={14} style={{ color: 'var(--ember-fire)' }} />
        <span
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        >
          Members · {group.users?.length || 0}
        </span>
      </div>
      <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={onClose}>
        <X size={13} color="var(--text-secondary)" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto scrollbar-hidden p-3 space-y-1">
      {group.users?.map((p, i) => (
        <ParticipantRow key={p._id || i} participant={p} />
      ))}
    </div>
  </div>
);

/* ── Participant row ── */
const ParticipantRow = ({ participant }) => {
  const isOnline = participant.status?.state === 'online';
  const initials = participant.name?.[0]?.toUpperCase() || '?';

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-xl transition-all cursor-default"
      style={{ background: 'var(--glass-surface)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--glass-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--glass-surface)')}
    >
      <div className="relative flex-shrink-0">
        {participant.avatar ? (
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {initials}
          </div>
        )}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
          style={{
            background: isOnline ? 'var(--online-dot)' : 'var(--text-muted)',
            border: '2px solid var(--bg-secondary)',
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 600,
            fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        >
          {participant.name || 'Unknown'}
        </p>
        <p
          style={{
            fontSize: '11px',
            color: isOnline ? 'var(--ember-cyan)' : 'var(--text-tertiary)',
            fontWeight: 500,
          }}
        >
          {isOnline ? '● Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
};

/* ── Inline error banner ── */
const ErrorBanner = ({ message }) => (
  <div
    className="flex-shrink-0 mx-4 mt-2 px-4 py-2 rounded-xl text-sm"
    style={{
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      color: 'var(--error)',
    }}
  >
    {message}
  </div>
);

/* ── Leave confirmation modal ── */
const ConfirmLeaveModal = ({ groupName, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in"
    style={{ background: 'var(--bg-overlay)' }}
  >
    <div
      className="w-full max-w-sm rounded-2xl animate-scale-in overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.12)' }}
        >
          <AlertTriangle size={16} color="var(--error)" strokeWidth={2} />
        </div>
        <h3
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 800,
            fontSize: '16px',
            color: 'var(--text-primary)',
          }}
        >
          Leave Group
        </h3>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to leave{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>"{groupName}"</span>?
          You won't receive further messages from this group.
        </p>
      </div>

      {/* Actions */}
      <div
        className="flex justify-end gap-2 px-5 py-3"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <button className="btn-ghost" style={{ padding: '9px 18px', fontSize: '13px' }} onClick={onCancel}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2"
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--error)',
            color: '#fff',
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <LogOut size={14} strokeWidth={2} />
          Leave Group
        </button>
      </div>
    </div>
  </div>
);

/* ── Welcome / no-selection screen ── */
const WelcomeScreen = ({ onCreateGroup }) => (
  <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
    {/* Layered orb */}
    <div className="relative mb-8">
      <div
        className="absolute rounded-full animate-orb"
        style={{
          inset: '-32px',
          background: 'radial-gradient(circle, rgba(255,87,34,0.1) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: '-16px',
          border: '1px solid rgba(255,87,34,0.08)',
        }}
      />
      <div
        className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255,87,34,0.12), rgba(233,30,99,0.08))',
          border: '1px solid rgba(255,87,34,0.18)',
        }}
      >
        <Users size={36} style={{ color: 'var(--ember-fire)', strokeWidth: 1.6 }} />
      </div>
      <div
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center animate-pulse"
        style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-fire)' }}
      >
        <Sparkles size={12} color="#fff" strokeWidth={2} />
      </div>
    </div>

    <h2
      className="mb-2"
      style={{
        fontFamily: "'Urbanist', sans-serif",
        fontWeight: 800,
        fontSize: '22px',
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
      }}
    >
      Pick a group to jump in
    </h2>
    <p
      className="mb-8 max-w-xs leading-relaxed"
      style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}
    >
      Select a group from the sidebar, or start a new one and bring your people together.
    </p>
    <button
      onClick={onCreateGroup}
      className="btn-ember flex items-center gap-2 no-select"
      style={{ padding: '12px 28px' }}
    >
      <Sparkles size={15} strokeWidth={2} />
      Create a Group
    </button>
  </div>
);

/* ── Mobile full-screen group modal ── */
const MobileGroupModal = ({
  selectedGroup, messages, isLoadingMessages, messagesEndRef,
  user, formatTime, showParticipants, onToggleParticipants,
  onLeaveGroup, onClose, onSendMessage, error,
}) => (
  <div
    className="fixed inset-0 z-50 flex flex-col animate-slide-up"
    style={{ background: 'var(--bg-base)' }}
  >
    {/* Mobile header */}
    <div
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
      }}
    >
      <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>
        <ChevronLeft size={18} color="var(--text-secondary)" strokeWidth={2.5} />
      </button>

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <Users size={15} color="#fff" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <h2
          className="truncate"
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontWeight: 800,
            fontSize: '15px',
            color: 'var(--text-primary)',
          }}
        >
          {selectedGroup.name}
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          {selectedGroup.users?.length || 0} members
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          className="btn-icon"
          style={
            showParticipants
              ? { background: 'var(--gradient-primary)', borderColor: 'transparent' }
              : {}
          }
          onClick={onToggleParticipants}
        >
          <Users size={15} color={showParticipants ? '#fff' : 'var(--text-secondary)'} />
        </button>
        <button
          className="btn-icon"
          style={{
            background: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.2)',
          }}
          onClick={onLeaveGroup}
        >
          <LogOut size={15} color="var(--error)" />
        </button>
      </div>
    </div>

    {/* Participants inline strip */}
    {showParticipants && (
      <div
        className="flex-shrink-0 mx-3 mt-2 rounded-2xl p-3 animate-fade-in"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          maxHeight: '180px',
          overflowY: 'auto',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.5px' }}>
            MEMBERS
          </span>
          <button onClick={onToggleParticipants}>
            <X size={12} color="var(--text-tertiary)" />
          </button>
        </div>
        <div className="space-y-1">
          {selectedGroup.users?.map((p, i) => (
            <ParticipantRow key={p._id || i} participant={p} />
          ))}
        </div>
      </div>
    )}

    {error && <ErrorBanner message={error} />}

    {/* Messages */}
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-3 space-y-3">
      <ChatMessagesArea
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        messagesEndRef={messagesEndRef}
        user={user}
        formatTime={formatTime}
        ownAvatar={profile?.avatar}
      />
    </div>

    {/* Input */}
    <div
      className="flex-shrink-0 p-3"
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
      }}
    >
      <GroupMessageInput onSendMessage={onSendMessage} />
    </div>
  </div>
);

export default GroupChats;