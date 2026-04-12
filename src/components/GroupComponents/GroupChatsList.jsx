import React from 'react';
import { Users, Plus, Sparkles } from 'lucide-react';
import GroupChatItem from './GroupChatItem';

const GroupChatsList = ({
  groupChats,
  selectedGroup,
  onSelectGroup,
  onCreateGroup,
  isMobile,
  isOffcanvasOpen,
  unreadGroups,
}) => {
  if (isMobile && isOffcanvasOpen) return null;

  return (
    <div
      className={`${isMobile ? 'w-full' : 'w-[340px]'} h-full flex flex-col`}
      style={{
        background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div>
          <h2
            className="text-lg no-select"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Groups
          </h2>
          {groupChats.length > 0 && (
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}
            >
              {groupChats.length} group{groupChats.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <button
          onClick={onCreateGroup}
          className="btn-ember flex items-center gap-2 no-select"
          style={{ padding: '9px 16px', fontSize: '13px', borderRadius: '12px' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Create</span>
        </button>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden p-3 space-y-1">
        {groupChats.length === 0 ? (
          <EmptyState onCreateGroup={onCreateGroup} />
        ) : (
          groupChats.map((group) => (
            <GroupChatItem
              key={group._id}
              group={group}
              isSelected={selectedGroup?._id === group._id}
              onSelect={onSelectGroup}
              hasUnread={unreadGroups?.has(group._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* ── Empty state ── */
const EmptyState = ({ onCreateGroup }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 animate-fade-in">

    {/* Orb illustration */}
    <div className="relative mb-8">
      {/* outer glow ring */}
      <div
        className="absolute inset-0 rounded-full animate-orb"
        style={{
          background: 'radial-gradient(circle, rgba(255,87,34,0.18) 0%, transparent 70%)',
          transform: 'scale(1.8)',
        }}
      />
      {/* middle ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: '1px solid rgba(255,87,34,0.12)',
          transform: 'scale(1.45)',
        }}
      />
      {/* icon container */}
      <div
        className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255,87,34,0.15), rgba(233,30,99,0.1))',
          border: '1px solid rgba(255,87,34,0.2)',
        }}
      >
        <Users
          size={32}
          style={{ color: 'var(--ember-fire)', strokeWidth: 1.8 }}
        />
      </div>

      {/* floating spark */}
      <div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center animate-pulse"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: 'var(--shadow-fire)',
        }}
      >
        <Sparkles size={11} color="#fff" strokeWidth={2} />
      </div>
    </div>

    <h3
      className="mb-2"
      style={{
        fontFamily: "'Urbanist', sans-serif",
        fontSize: '20px',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: 'var(--text-primary)',
      }}
    >
      No groups yet
    </h3>

    <p
      className="mb-8 text-sm leading-relaxed max-w-[200px]"
      style={{ color: 'var(--text-tertiary)' }}
    >
      Gather your people. Create a group to start the conversation.
    </p>

    <button
      onClick={onCreateGroup}
      className="btn-ember flex items-center gap-2 no-select"
      style={{ padding: '12px 24px', fontSize: '14px' }}
    >
      <Plus size={16} strokeWidth={2.5} />
      Create a Group
    </button>
  </div>
);

export default GroupChatsList;