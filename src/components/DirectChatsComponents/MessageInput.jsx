import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Eye, EyeOff, X, CornerUpRight } from 'lucide-react';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  selectedChatId,
  user,
  otherUser,
  replyingTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("");
  const [ghostEnabled, setGhostEnabled] = useState(true);
  const textareaRef = useRef(null);
  const userId = user.id;
  const otherUserId = otherUser._id;

  const { otherUserTyping, ghostText, startTyping, stopTyping, emitGhostTyping } = useTypingIndicator(
    selectedChatId,
    userId,
    otherUserId
  );

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    stopTyping();
    onSendMessage(trimmed, replyingTo?._id || null);
    setMessage("");
    if (onCancelReply) onCancelReply();
  }, [message, onSendMessage, disabled, stopTyping, replyingTo, onCancelReply]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setMessage(val);
    if (val.trim() && !disabled) {
      startTyping();
      if (ghostEnabled) emitGhostTyping(val);
    } else {
      stopTyping();
    }
  }, [startTyping, stopTyping, disabled, ghostEnabled, emitGhostTyping]);

  const handleBlur = useCallback(() => stopTyping(), [stopTyping]);

  const hasContent = message.trim().length > 0;
  const isOverLimit = message.length > 480;

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>

      {/* Reply preview */}
      {replyingTo && (
        <div className="reply-input-preview animate-fade-in">
          <CornerUpRight size={14} style={{ color: 'var(--ember-violet)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ember-violet)' }}>
              Replying to {replyingTo.senderId?.name || (replyingTo.senderId === user.id ? 'yourself' : 'message')}
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

      {/* Ghost typing preview — shows what the other person is typing in real-time */}
      {otherUserTyping && ghostText && (
        <div
          className="animate-fade-in"
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(90deg, rgba(139,92,246,0.06), rgba(255,87,34,0.04))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Eye size={14} style={{ color: 'var(--ember-violet)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em' }}>
                {otherUser?.name ?? 'User'} is typing
              </span>
              <p
                className="ghost-text-preview"
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: 13,
                  fontStyle: 'italic',
                  marginTop: 2,
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {ghostText}
                <span className="ghost-cursor" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fallback: normal typing indicator when ghost text is empty */}
      {otherUserTyping && !ghostText && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', gap: 3 }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>
            {otherUser?.name ?? 'User'} is typing
          </span>
        </div>
      )}

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>

        {/* Ghost mode toggle */}
        <button
          onClick={() => setGhostEnabled((p) => !p)}
          aria-label={ghostEnabled ? 'Disable ghost typing' : 'Enable ghost typing'}
          title={ghostEnabled ? 'Telepathy Mode: ON — others see your keystrokes live' : 'Telepathy Mode: OFF — normal typing indicator'}
          className="btn-icon"
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            background: ghostEnabled ? 'rgba(139,92,246,0.15)' : 'var(--glass-surface)',
            borderColor: ghostEnabled ? 'rgba(139,92,246,0.3)' : 'var(--glass-border)',
          }}
        >
          {ghostEnabled
            ? <Eye size={16} style={{ color: 'var(--ember-violet)' }} />
            : <EyeOff size={16} style={{ color: 'var(--text-muted)' }} />
          }
        </button>

        {/* Textarea wrapper */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Character warning */}
          {message.length > 400 && (
            <span
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: -22,
                right: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isOverLimit ? 'var(--error)' : 'var(--text-muted)',
              }}
            >
              {message.length}/500
            </span>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="input-ember scrollbar-hidden"
            style={{
              resize: 'none',
              minHeight: 44,
              maxHeight: 120,
              lineHeight: 1.5,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 16,
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!hasContent || disabled || isOverLimit}
          aria-label="Send message"
          className={hasContent && !disabled && !isOverLimit ? 'btn-ember' : 'btn-ghost'}
          style={{
            padding: 0,
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-lg)',
            flexShrink: 0,
            opacity: !hasContent || disabled ? 0.45 : 1,
            cursor: !hasContent || disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;