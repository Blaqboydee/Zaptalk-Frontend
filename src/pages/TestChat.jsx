import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ArrowLeft } from 'lucide-react';

/**
 * Self-contained test chat screen — NO auth, NO sockets, NO context.
 * Route: /test-chat
 * 
 * APPROACH: Pure CSS — no visualViewport JS at all.
 * Uses height:100% chain + overflow:hidden to prevent browser scroll.
 * The modal is a full-screen flex column that naturally compresses
 * when the keyboard appears because the browser shrinks the viewport.
 */

const MOCK_MESSAGES = [
  { _id: '1', content: 'Hey! How are you?', senderId: 'other', ts: Date.now() - 60000 * 10 },
  { _id: '2', content: "I'm good! Working on the app", senderId: 'me', ts: Date.now() - 60000 * 9 },
  { _id: '3', content: "That's awesome, how's it going?", senderId: 'other', ts: Date.now() - 60000 * 8 },
  { _id: '4', content: 'Pretty well, fixing keyboard issues on mobile', senderId: 'me', ts: Date.now() - 60000 * 7 },
  { _id: '5', content: 'Haha those are always fun', senderId: 'other', ts: Date.now() - 60000 * 6 },
  { _id: '6', content: 'Tell me about it 😅', senderId: 'me', ts: Date.now() - 60000 * 5 },
  { _id: '7', content: 'Have you tried the visualViewport API?', senderId: 'other', ts: Date.now() - 60000 * 4 },
  { _id: '8', content: 'Yeah multiple times, tricky on iOS', senderId: 'me', ts: Date.now() - 60000 * 3 },
  { _id: '9', content: 'The header keeps getting pushed up', senderId: 'me', ts: Date.now() - 60000 * 2 },
  { _id: '10', content: 'You got this! 🔥', senderId: 'other', ts: Date.now() - 60000 },
  { _id: '11', content: 'This message is here so you have enough to scroll', senderId: 'other', ts: Date.now() - 50000 },
  { _id: '12', content: 'Testing testing 1 2 3', senderId: 'me', ts: Date.now() - 40000 },
  { _id: '13', content: 'More messages for scrolling', senderId: 'other', ts: Date.now() - 30000 },
  { _id: '14', content: 'Almost there!', senderId: 'me', ts: Date.now() - 20000 },
  { _id: '15', content: 'Last mock message', senderId: 'other', ts: Date.now() - 10000 },
];

export default function TestChat() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ background: '#06040C', minHeight: '100dvh', padding: 20 }}>
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
        Keyboard Test Page
      </h1>
      <p style={{ color: '#A09CB8', fontSize: 14, marginBottom: 24 }}>
        No auth required. Tap below to test keyboard behavior.
      </p>
      <button
        onClick={() => setChatOpen(true)}
        style={{
          padding: '14px 28px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #FF5722, #E91E63)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Open Chat Modal
      </button>

      {chatOpen && <MockChatModal onClose={() => setChatOpen(false)} />}
    </div>
  );
}

/*
 * CSS-only approach:
 * - No visualViewport tracking
 * - No height in JS state
 * - Lock html+body overflow so browser CANNOT scroll behind modal
 * - Use `position:fixed; inset:0` — browser automatically keeps this
 *   within the visual viewport (including keyboard) on modern mobile browsers
 * - The flex column (header + messages + input) naturally compresses
 *   the messages area when space is reduced
 */
function MockChatModal({ onClose }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Direct DOM manipulation — no React state, no re-render lag.
  // Syncs container position + size to the visual viewport on every frame.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const html = document.documentElement;
    const body = document.body;

    // Lock page scroll
    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';

    const vv = window.visualViewport;

    const sync = () => {
      if (vv) {
        // offsetTop = how far the visual viewport has scrolled from the layout viewport top
        // When keyboard opens, browser scrolls down → offsetTop increases
        // We move our container down by that amount so it stays in the visible area
        container.style.top = vv.offsetTop + 'px';
        container.style.height = vv.height + 'px';
      } else {
        container.style.top = '0px';
        container.style.height = window.innerHeight + 'px';
      }
    };

    sync();

    if (vv) {
      vv.addEventListener('resize', sync);
      vv.addEventListener('scroll', sync);
    }
    window.addEventListener('resize', sync);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', sync);
        vv.removeEventListener('scroll', sync);
      }
      window.removeEventListener('resize', sync);
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { _id: Date.now().toString(), content: text, senderId: 'me', ts: Date.now() },
    ]);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}
      />

      {/* 
        Chat container.
        position:fixed — top + height are set by JS to match visualViewport.
        This means the container always fills exactly the visible area,
        even when the keyboard is open.
        Direct DOM mutation = no React re-render = no lag.
      */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100dvh', // fallback before JS kicks in
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F0F1A',
          overflow: 'hidden',
          overscrollBehavior: 'none',
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            borderBottom: '1px solid #2D2640',
            backgroundColor: '#1A1625',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: '#252032', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #E91E63)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
            }}
          >
            T
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Test User</div>
            <div style={{ color: '#22D3EE', fontSize: 12 }}>online</div>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            padding: '12px 16px',
          }}
        >
          {messages.map((msg) => {
            const isMine = msg.senderId === 'me';
            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMine
                      ? 'linear-gradient(135deg, #FF5722, #E91E63)'
                      : '#1E1A2E',
                    color: '#fff',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
            borderTop: '1px solid #2D2640',
            backgroundColor: '#161222',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 24,
              border: '1px solid #2D2640',
              backgroundColor: '#1E1A2E',
              color: '#fff',
              fontSize: 16, // 16px prevents iOS auto-zoom on focus
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg, #FF5722, #E91E63)'
                : '#252032',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Send size={18} color="#fff" />
          </button>
        </div>
      </div>
    </>
  );
}
