import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatTime } from "../../utils/formatTime";
import { Edit2, Trash2, Check, X, Flame, Reply, CornerUpRight } from "lucide-react";
import UserProfileDrawer from "../UserProfileDrawer";

const ChatMessages = ({
  messages,
  selectedChatId,
  user,
  otherUser,
  profile,
  isLoadingMessages,
  messagesEndRef,
  onEditMessage,
  onDeleteMessage,
  onReply,
  isMobile,
}) => {
  // State for message options modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [drawerUser, setDrawerUser] = useState(null);

  // Refs
  const modalRef = useRef(null);
  const editInputRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedMessage(null);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [longPressTimer]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleLongPressStart = useCallback((message, event) => {
    const isOwnMessage = message.senderId?._id === user?.id || message.senderId === user?.id;
    if (!user) return;

    clearLongPressTimer();

    const rect = event.currentTarget?.getBoundingClientRect();
    if (!rect) return;

    const timer = setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const viewportWidth = window.innerWidth;
      const modalWidth = 150;

      let xPos = rect.right + 10;
      if (xPos + modalWidth > viewportWidth) {
        xPos = rect.left - modalWidth + 10;
      }

      setModalPosition({
        x: Math.max(10, xPos),
        y: rect.top + scrollTop,
      });

      setSelectedMessage({ ...message, _isOwn: isOwnMessage });
      setEditText(message.content || "");
    }, 500);

    setLongPressTimer(timer);
  }, [user, clearLongPressTimer]);

  const handleLongPressEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || !selectedMessage) return;

    try {
      await onEditMessage(selectedMessage._id, editText.trim());
      setIsEditing(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  }, [editText, selectedMessage, onEditMessage]);

  const handleCancelEdit = useCallback(() => {
    setEditText(selectedMessage?.content || "");
    setIsEditing(false);
  }, [selectedMessage]);

  const handleDelete = useCallback(async () => {
    if (!selectedMessage) return;

    try {
      await onDeleteMessage(selectedMessage._id);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }, [selectedMessage, onDeleteMessage]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === "Escape") {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleReply = useCallback(() => {
    if (!selectedMessage || !onReply) return;
    onReply(selectedMessage);
    setSelectedMessage(null);
  }, [selectedMessage, onReply]);

  if (!user) return null;

  return (
    <>
      {/* ── Messages scroll area ── */}
      <div
        className="scrollbar-hidden"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          backgroundColor: 'var(--bg-base)',
        }}
      >
        {/* Loading skeletons */}
        {isLoadingMessages && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0' }}>
            {[70, 45, 80, 55].map((w, i) => {
              const sent = i % 2 === 1;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: sent ? 'flex-end' : 'flex-start', animation: 'emberPulse 2s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}>
                  <div style={{ height: 36, width: `${w}%`, maxWidth: '75%', borderRadius: sent ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: sent ? 'var(--bg-active)' : 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingMessages && (!messages || messages.length === 0) && (
          <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-xl)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fire)' }}>
              <Flame size={24} color="#fff" strokeWidth={1.5} />
            </div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>No messages yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Send the first message to get the conversation going 🔥</p>
          </div>
        )}

        {/* Message list */}
        {!isLoadingMessages && messages?.map((message) => {
          if (!message?._id) return null;
          const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
          const senderName = typeof message.senderId === 'object'
            ? message.senderId?.name
            : (isOwnMessage ? user.name : otherUser?.name ?? 'Unknown');
          const senderAvatar = isOwnMessage
            ? (profile?.avatar ?? null)
            : (typeof message.senderId === 'object' ? message.senderId?.avatar : otherUser?.avatar ?? null);

          return (
            <div
              key={message._id}
              className="animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                gap: 8,
                alignItems: 'flex-end',
                padding: '2px 0',
              }}
            >
              {/* Avatar */}
              <div
                onClick={() => {
                  const senderData = isOwnMessage
                    ? { _id: user.id, name: user.name, email: user.email, avatar: profile?.avatar }
                    : (typeof message.senderId === 'object'
                        ? message.senderId
                        : { _id: message.senderId, name: senderName, avatar: senderAvatar });
                  setDrawerUser(senderData);
                }}
                style={{ width: 28, height: 28, borderRadius: '50%', background: isOwnMessage ? 'var(--gradient-primary)' : 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, flexShrink: 0, overflow: 'hidden', boxShadow: isOwnMessage ? 'var(--shadow-fire)' : 'var(--shadow-sm)', cursor: 'pointer', transition: 'transform 150ms var(--ease-out)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {senderAvatar
                  ? <img src={senderAvatar} alt={senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : senderName?.charAt(0)?.toUpperCase() ?? '?'
                }
              </div>

              {/* Bubble + meta */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start', gap: 3, maxWidth: '75%' }}>
                {/* Name + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexDirection: isOwnMessage ? 'row-reverse' : 'row' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 11 }}>{senderName}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{message.createdAt ? formatTime(message.createdAt) : ''}</span>
                  {message.pending && <span style={{ color: 'var(--text-muted)', fontSize: 10, fontStyle: 'italic' }}>sending…</span>}
                </div>

                {/* Bubble — long press to open actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                  {/* Reply banner */}
                  {message.replyTo && (
                    <div className="reply-banner" style={{ alignSelf: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                      <CornerUpRight size={11} style={{ flexShrink: 0, color: 'var(--ember-violet)', marginTop: 1 }} />
                      <div style={{ minWidth: 0 }}>
                        <span className="reply-banner-name">
                          {message.replyTo.senderId?.name || 'Unknown'}
                        </span>
                        <span className="reply-banner-text">{message.replyTo.content}</span>
                      </div>
                    </div>
                  )}

                  <div
                    className={isOwnMessage ? 'bubble-sent' : 'bubble-received'}
                    style={{ opacity: message.pending ? 0.6 : 1, cursor: 'default', userSelect: 'text' }}
                    onMouseDown={(e) => handleLongPressStart(message, e)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={(e) => handleLongPressStart(message, e)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                  >
                    {message.content || ''}
                    {message.edited && (
                      <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 6 }}>(edited)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Message actions popover ── */}
      {selectedMessage && (
        <div
          ref={modalRef}
          className="animate-fade-in"
          style={{
            position: 'fixed',
            left: modalPosition.x,
            top: modalPosition.y,
            transform: 'translateY(-50%)',
            zIndex: 70,
            minWidth: isEditing ? 300 : 148,
            maxWidth: '90vw',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {isEditing ? (
            <EditMessageForm
              editText={editText}
              setEditText={setEditText}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              onKeyDown={handleKeyDown}
              editInputRef={editInputRef}
            />
          ) : (
            <MessageOptions
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReply={handleReply}
              isOwn={selectedMessage?._isOwn}
            />
          )}
        </div>
      )}

      {/* ── User profile drawer ── */}
      {drawerUser && (
        <UserProfileDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}
    </>
  );
};

const EditMessageForm = ({ editText, setEditText, onSave, onCancel, onKeyDown, editInputRef }) => (
  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <Edit2 size={14} style={{ color: 'var(--text-fire)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>Edit message</span>
    </div>

    <textarea
      ref={editInputRef}
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      onKeyDown={onKeyDown}
      rows={3}
      maxLength={500}
      placeholder="Edit your message…"
      className="input-ember scrollbar-hidden"
      style={{ resize: 'none', fontSize: 13 }}
    />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{editText.length}/500</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={onCancel}
          className="btn-ghost"
          style={{ padding: '6px 14px', fontSize: 12 }}
        >
          <X size={12} /> Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!editText.trim()}
          className="btn-ember"
          style={{ padding: '6px 14px', fontSize: 12, opacity: !editText.trim() ? 0.5 : 1 }}
        >
          <Check size={12} /> Save
        </button>
      </div>
    </div>
  </div>
);

const MessageOptions = ({ onEdit, onDelete, onReply, isOwn }) => (
  <div style={{ padding: '4px 0' }}>
    {/* Reply — always available */}
    <button
      onClick={onReply}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, textAlign: 'left' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Reply size={14} style={{ color: 'var(--ember-violet)', flexShrink: 0 }} /> Reply
    </button>
    {isOwn && (
      <>
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '2px 0' }} />
        <button
          onClick={onEdit}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, textAlign: 'left' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Edit2 size={14} style={{ color: 'var(--text-fire)', flexShrink: 0 }} /> Edit
        </button>
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '2px 0' }} />
        <button
          onClick={onDelete}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 13, fontWeight: 600, textAlign: 'left' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 size={14} style={{ flexShrink: 0 }} /> Delete
        </button>
      </>
    )}
  </div>
);

export default ChatMessages;