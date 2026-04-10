import React from 'react';
import ReactDOM from 'react-dom';
import { X, Mail } from 'lucide-react';

const UserProfileDrawer = ({ user: targetUser, onClose }) => {
  if (!targetUser) return null;

  const { name, email, avatar } = targetUser;
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 200,
          background: 'var(--bg-overlay)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'emberFadeIn 200ms var(--ease-out) both',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed', right: 0, top: 0,
          height: '100dvh', width: 300,
          zIndex: 201,
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'drawerSlideIn 260ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 16px 14px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>Profile</span>
          <button className="btn-icon" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '32px 20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 32,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-fire)',
            flexShrink: 0,
          }}>
            {avatar
              ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initial
            }
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
              {name}
            </p>
          </div>

          {/* Info row */}
          {email && (
            <div style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}>
              <Mail size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{
                color: 'var(--text-secondary)', fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {email}
              </span>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default UserProfileDrawer;
