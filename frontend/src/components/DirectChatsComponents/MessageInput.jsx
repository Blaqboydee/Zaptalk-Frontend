import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  selectedChatId,
  user,
  otherUser,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const userId = user.id;
  const otherUserId = otherUser._id;

  const { otherUserTyping, startTyping, stopTyping } = useTypingIndicator(
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
    onSendMessage(trimmed);
    setMessage("");
  }, [message, onSendMessage, disabled, stopTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setMessage(val);
    if (val.trim() && !disabled) startTyping();
    else stopTyping();
  }, [startTyping, stopTyping, disabled]);

  const handleBlur = useCallback(() => stopTyping(), [stopTyping]);

  const hasContent = message.trim().length > 0;
  const isOverLimit = message.length > 480;

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>

      {/* Typing indicator */}
      {otherUserTyping && (
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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 16px' }}>

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
              fontSize: 14,
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

      {/* Hint */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 16px 10px',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
          Enter to send · Shift+Enter for new line
        </span>
        {hasContent && !isOverLimit && (
          <span
            className="animate-fade-in gradient-text"
            style={{ fontSize: 11, fontWeight: 700 }}
          >
            Ready ↑
          </span>
        )}
        {isOverLimit && (
          <span style={{ color: 'var(--error)', fontSize: 11, fontWeight: 600 }}>
            Message too long
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;