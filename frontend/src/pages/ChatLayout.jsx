import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { MessageSquare, Users, Flame, Menu } from 'lucide-react';
import { useGlobalSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatLayout = ({ user }) => {
  const [allMessages, setAllMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { socket } = useGlobalSocket();
  const { profile } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!socket) { setIsOnline(false); return; }
    setIsOnline(socket.connected);
    const onConnect    = () => setIsOnline(true);
    const onDisconnect = () => setIsOnline(false);
    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/messages/all`);
        setAllMessages(res.data.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [apiUrl]);

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── Fixed Top Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          backgroundColor: 'rgba(15, 13, 24, 0.92)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="md:pl-[240px]"
          style={{
            padding: '0 12px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Left — mobile toggle + flame logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Mobile-only hamburger */}
            <button
              className="btn-icon md:hidden"
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-sidebar'))}
              aria-label="Menu"
            >
              <Menu size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div
                style={{
                  background: 'var(--gradient-primary)',
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-fire)',
                }}
              >
                <Flame size={15} color="#fff" strokeWidth={2} />
              </div>
              {/* Logo text — hidden on mobile */}
              <span
                className="hidden md:inline"
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                ember<span className="gradient-text">.</span>
              </span>
            </div>
          </div>

          {/* Center — tabs */}
          <nav style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="tab-group">
              <NavLink to="/allchats/directmessages">
                {({ isActive }) => (
                  <span className={`tab-pill ${isActive ? 'active' : ''}`}>
                    <MessageSquare size={13} />
                    Direct
                  </span>
                )}
              </NavLink>
              <NavLink to="/allchats/groups">
                {({ isActive }) => (
                  <span className={`tab-pill ${isActive ? 'active' : ''}`}>
                    <Users size={13} />
                    Groups
                  </span>
                )}
              </NavLink>
            </div>
          </nav>

          {/* Right — status dot + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Full pill on desktop, dot-only on mobile */}
            <div
              className="hidden md:inline-flex"
              style={{
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: isOnline ? 'rgba(34,197,94,0.12)' : 'rgba(113,113,122,0.12)',
                border: `1px solid ${isOnline ? 'rgba(34,197,94,0.3)' : 'rgba(113,113,122,0.25)'}`,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isOnline ? '#22C55E' : '#71717A', flexShrink: 0, ...(isOnline && { boxShadow: '0 0 6px #22C55E' }) }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: isOnline ? '#22C55E' : '#71717A', letterSpacing: '0.02em' }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {/* Mobile-only dot indicator */}
            <span
              className="md:hidden"
              style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: isOnline ? '#22C55E' : '#71717A',
                flexShrink: 0,
                ...(isOnline && { boxShadow: '0 0 6px #22C55E' }),
              }}
            />

            {/* Avatar — link to profile */}
            {user && (
              <Link
                to="/profile"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: profile?.avatar ? 'transparent' : 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#fff',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 150ms var(--ease-out)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name?.[0]?.toUpperCase() ?? 'U'
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="pt-[56px] animate-fade-in">
        {isLoading ? (
          <LoadingState />
        ) : (
          <Outlet context={{ user, allMessages }} />
        )}
      </main>

    </div>
  );
};

/* ── Loading skeleton ── */
const LoadingState = () => (
  <div
    className="flex flex-col items-center justify-center gap-5"
    style={{ paddingTop: '80px' }}
  >
    {/* Spinner with ember gradient */}
    <div style={{ position: 'relative', width: 52, height: 52 }}>
      <svg
        width={52}
        height={52}
        viewBox="0 0 52 52"
        style={{ animation: 'spin 0.9s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle
          cx="26" cy="26" r="22"
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="3"
        />
        <circle
          cx="26" cy="26" r="22"
          fill="none"
          stroke="url(#spinGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60 80"
        />
        <defs>
          <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5722" />
            <stop offset="100%" stopColor="#E91E63" />
          </linearGradient>
        </defs>
      </svg>
      <Flame
        size={18}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-fire)',
        }}
        strokeWidth={2}
      />
    </div>

    <div className="flex flex-col items-center gap-1">
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Loading your conversations
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Just a sec…
      </p>
    </div>

    {/* Ghost skeleton rows */}
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginTop: 8,
      }}
    >
      {[1, 0.7, 0.5].map((opacity, i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity,
            animation: 'emberPulse 2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                height: 12,
                width: '45%',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-tertiary)',
              }}
            />
            <div
              style={{
                height: 10,
                width: '70%',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-hover)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ChatLayout;