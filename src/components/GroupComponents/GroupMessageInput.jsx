import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, EyeOff, X, CornerUpRight } from 'lucide-react';

const GroupMessageInput = ({
  onSendMessage,
  disabled = false,
  confessionMode = false,
  replyingTo,
  onCancelReply,
  members = [],
}) => {
  const [message, setMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [selectedMentionIds, setSelectedMentionIds] = useState([]);
  const inputRef = useRef(null);
  const mentionRef = useRef(null);

  // Filter members for @mention dropdown
  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMentions) return;
    const close = (e) => {
      if (mentionRef.current && !mentionRef.current.contains(e.target)) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMentions]);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) inputRef.current.focus();
  }, [replyingTo]);

  const handleChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    // Detect @ for mention
    const cursorPos = e.target.selectionStart;
    const textUpToCursor = val.slice(0, cursorPos);
    const atMatch = textUpToCursor.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = useCallback((member) => {
    const cursorPos = inputRef.current?.selectionStart || message.length;
    const textUpToCursor = message.slice(0, cursorPos);
    const atIdx = textUpToCursor.lastIndexOf('@');
    if (atIdx === -1) return;

    const before = message.slice(0, atIdx);
    const after = message.slice(cursorPos);
    const newMessage = `${before}@${member.name} ${after}`;
    setMessage(newMessage);
    setShowMentions(false);

    // Track mentioned user ID
    setSelectedMentionIds(prev => {
      if (prev.includes(member._id)) return prev;
      return [...prev, member._id];
    });

    // Focus input back
    setTimeout(() => {
      if (inputRef.current) {
        const pos = atIdx + member.name.length + 2; // @ + name + space
        inputRef.current.focus();
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSendMessage(message, confessionMode, replyingTo?._id || null, selectedMentionIds);
    setMessage('');
    setSelectedMentionIds([]);
    if (onCancelReply) onCancelReply();
  };

  const handleKeyPress = (e) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2" style={{ position: 'relative' }}>
      {/* Reply preview */}
      {replyingTo && (
        <div className="reply-input-preview animate-fade-in">
          <CornerUpRight size={14} style={{ color: 'var(--ember-violet)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ember-violet)' }}>
              Replying to {replyingTo.senderId?.name || replyingTo.anonymousAlias || 'message'}
            </span>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
              {replyingTo.content}
            </p>
          </div>
          <button onClick={onCancelReply} className="btn-icon" style={{ width: 28, height: 28, flexShrink: 0 }}>
            <X size={13} color="var(--text-muted)" />
          </button>
        </div>
      )}

      {confessionMode && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg animate-fade-in"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <EyeOff size={13} style={{ color: '#8B5CF6' }} />
          <span style={{ color: '#A78BFA', fontSize: 11, fontWeight: 600 }}>
            Confession Mode — your identity is hidden
          </span>
        </div>
      )}

      {/* @Mention dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div
          ref={mentionRef}
          className="mention-dropdown animate-fade-in"
        >
          {filteredMembers.slice(0, 8).map((member, i) => (
            <button
              key={member._id}
              className={`mention-dropdown-item ${i === mentionIndex ? 'active' : ''}`}
              onClick={() => insertMention(member)}
              onMouseEnter={() => setMentionIndex(i)}
            >
              <div className="mention-dropdown-avatar">
                {member.avatar
                  ? <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : member.name?.charAt(0)?.toUpperCase() || '?'
                }
              </div>
              <span className="mention-dropdown-name">{member.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={confessionMode ? "Confess anonymously..." : "Type your message..."}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            backgroundColor: confessionMode ? '#1A1035' : '#252032',
            border: confessionMode ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #2D2640',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = confessionMode ? '#8B5CF6' : '#8B5CF6';
            e.target.style.boxShadow = confessionMode
              ? '0 0 0 2px rgba(139, 92, 246, 0.2)'
              : '0 0 0 2px rgba(139, 92, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = confessionMode ? 'rgba(139, 92, 246, 0.3)' : '#2D2640';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button 
          onClick={handleSubmit}
          className="text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
          style={{
            backgroundColor: !message.trim() || disabled ? '#6D28D9' : '#8B5CF6'
          }}
          onMouseEnter={(e) => {
            if (message.trim() && !disabled) {
              e.currentTarget.style.backgroundColor = '#7C3AED';
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim() && !disabled) {
              e.currentTarget.style.backgroundColor = '#8B5CF6';
            }
          }}
          disabled={!message.trim() || disabled}
        >
          <Send size={18} className={message.trim() && !disabled ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
};

export default GroupMessageInput;