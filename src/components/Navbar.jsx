import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGlobalSocket } from "../context/SocketContext";
import {
  MessageCircle,
  Users,
  UserPlus,
  User as UserIcon,
  LogOut,
  Flame,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/allchats",  label: "My Chats",    Icon: MessageCircle },
  { to: "/friends",   label: "Friends",     Icon: Users         },
  { to: "/users",     label: "Find People", Icon: UserPlus      },
  { to: "/profile",   label: "Profile",     Icon: UserIcon      },
];

export default function Navbar() {
  const { user, logout, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useGlobalSocket();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setDrawerOpen((v) => !v);
    window.addEventListener('toggle-nav-sidebar', handler);
    return () => window.removeEventListener('toggle-nav-sidebar', handler);
  }, []);

  const handleLogout = () => {
    socket?.emit("user-offline", profile?._id);
    logout();
    navigate("/login");
    setDrawerOpen(false);
  };

  return (
    <>
      {/* â”€â”€ Desktop sidebar (always visible â‰¥ md) â”€â”€ */}
      <aside
        className="hidden md:flex"
        style={{
          position: 'fixed', top: 0, left: 0,
          height: '100dvh', width: 240,
          zIndex: 50,
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fire)', flexShrink: 0 }}>
              <Flame size={15} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
              ember<span className="gradient-text">.</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {user && NAV_LINKS.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  background: active ? 'var(--bg-active)' : 'transparent',
                  border: `1px solid ${active ? 'var(--border-fire)' : 'transparent'}`,
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                <Icon size={17} style={{ color: active ? 'var(--text-fire)' : 'inherit', flexShrink: 0 }} />
                {label}
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--gradient-primary)' }} />}
              </Link>
            );
          })}
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <Link to="/signup" className="btn-ghost" style={{ justifyContent: 'flex-start', gap: 10 }}><UserPlus size={15} /> Sign up</Link>
              <Link to="/login" className="btn-ember" style={{ justifyContent: 'flex-start', gap: 10 }}><Flame size={15} /> Log in</Link>
            </div>
          )}
        </div>

        {/* User card + logout */}
        {user && (
          <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'border-color 150ms var(--ease-out)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-fire)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: profile?.avatar ? 'transparent' : 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, overflow: 'hidden', flexShrink: 0 }}>
                {profile?.avatar ? <img src={profile.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.name?.charAt(0)?.toUpperCase() ?? 'U')}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name ?? 'User'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Online</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: 'var(--error)', fontSize: 13, fontWeight: 600, transition: 'all var(--duration-fast) var(--ease-out)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            >
              <LogOut size={15} style={{ flexShrink: 0 }} /> Log out
            </button>
          </div>
        )}
      </aside>

      {/* â”€â”€ Mobile drawer (off-canvas, triggered by toggle-nav-sidebar) â”€â”€ */}
      {drawerOpen && (
        <div
          className="md:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 55, backgroundColor: 'var(--bg-overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        />
      )}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', top: 0, left: 0,
          height: '100dvh', width: 280,
          zIndex: 60,
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 350ms var(--ease-out)',
          boxShadow: drawerOpen ? 'var(--shadow-lg)' : 'none',
        }}
      >
        <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link to="/" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fire)' }}>
              <Flame size={14} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em' }}>ember<span className="gradient-text">.</span></span>
          </Link>
          <button className="btn-icon" onClick={() => setDrawerOpen(false)}><X size={15} /></button>
        </div>
        <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {user && NAV_LINKS.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} onClick={() => setDrawerOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-lg)', textDecoration: 'none', background: active ? 'var(--bg-active)' : 'transparent', border: `1px solid ${active ? 'var(--border-fire)' : 'transparent'}`, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 700 : 500, fontSize: 14 }}
              >
                <Icon size={17} style={{ color: active ? 'var(--text-fire)' : 'inherit', flexShrink: 0 }} />
                {label}
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--gradient-primary)' }} />}
              </Link>
            );
          })}
        </div>
        {user && (
          <div style={{ padding: '10px 10px 16px', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: 'var(--error)', fontSize: 13, fontWeight: 600 }}
            >
              <LogOut size={15} style={{ flexShrink: 0 }} /> Log out
            </button>
          </div>
        )}
      </div>

      {/* â”€â”€ Mobile bottom nav â”€â”€ */}
      {user && (
        <nav
          className="flex md:hidden"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            zIndex: 30,
            height: 60,
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {NAV_LINKS.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, flex: 1, height: '100%',
                  textDecoration: 'none',
                  color: active ? 'var(--text-fire)' : 'var(--text-muted)',
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  transition: 'color var(--duration-fast) var(--ease-out)',
                  position: 'relative',
                }}
              >
                {active && (
                  <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 2, borderRadius: '0 0 2px 2px', background: 'var(--gradient-primary)' }} />
                )}
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
