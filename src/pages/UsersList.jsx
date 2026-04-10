import { useState, useContext } from "react";
import { useUsers } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import { useFriends } from "../hooks/useFriends.js";
import { Search, UserPlus, Users as UsersIcon, Check, X, Clock, Flame, Eye, Mail, Calendar } from "lucide-react";

export default function UsersList() {
  const { users, loading } = useUsers();
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [addingFriendId, setAddingFriendId] = useState(null);
  const [cancelingFriendId, setCancelingFriendId] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  const { friends, sentRequests, addFriend, cancelFriendRequest, refetchAll } = useFriends();

  const filteredUsers = users.filter(
    (u) =>
      u._id !== user?.id &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFriend = async (targetUser) => {
    setAddingFriendId(targetUser._id);
    try { await addFriend(targetUser, user.id); await refetchAll(); }
    catch (e) { console.error(e); }
    finally { setAddingFriendId(null); }
  };

  const handleCancelRequest = async (friendId) => {
    setCancelingFriendId(friendId);
    try { await cancelFriendRequest(friendId); await refetchAll(); }
    catch (e) { console.error(e); }
    finally { setCancelingFriendId(null); }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh', backgroundColor: 'var(--bg-base)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div className="animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width={52} height={52} viewBox="0 0 52 52" style={{ animation: 'spin 0.9s linear infinite' }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <circle cx="26" cy="26" r="22" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
              <circle cx="26" cy="26" r="22" fill="none" stroke="url(#sg)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 80" />
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF5722" />
                  <stop offset="100%" stopColor="#E91E63" />
                </linearGradient>
              </defs>
            </svg>
            <Flame size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--text-fire)' }} strokeWidth={2} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15 }}>Discovering people…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--bg-base)' }}>

      {/* ── Fixed header ── */}
      <div
        className="page-header-fixed"
        style={{
          backgroundColor: 'rgba(15,13,24,0.92)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 20px 14px' }}>

          {/* Title row */}
          <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
              <UsersIcon size={18} style={{ color: 'var(--text-fire)' }} />
              <h1 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>
                Find your people
              </h1>
              {/* User count pill */}
              <span
                className="badge-fire"
                style={{ fontSize: 10, padding: '2px 8px' }}
              >
                {filteredUsers.length.toLocaleString()} users
              </span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-ember"
              style={{ paddingLeft: 40, paddingRight: searchTerm ? 40 : 16 }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn-icon"
                style={{
                  position: 'absolute', right: 6, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 28, height: 28,
                  border: 'none', background: 'transparent',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ paddingTop: 128, paddingBottom: 40 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px' }}>

          {filteredUsers.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              {/* Mobile list */}
              <div className="flex flex-col gap-2 md:hidden">
                {filteredUsers.map((u, i) => (
                  <UserRow
                    key={u._id}
                    user={u}
                    isFriend={friends?.some((f) => f._id === u._id)}
                    hasSentRequest={sentRequests?.some((r) => r.to._id === u._id)}
                    isAdding={addingFriendId === u._id}
                    isCanceling={cancelingFriendId === u._id}
                    onAddFriend={handleAddFriend}
                    onCancelRequest={handleCancelRequest}
                    onViewProfile={setProfileUser}
                    index={i}
                  />
                ))}
              </div>

              {/* Desktop grid */}
              <div
                className="hidden md:grid"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                }}
              >
                {filteredUsers.map((u, i) => (
                  <UserGridCard
                    key={u._id}
                    user={u}
                    isFriend={friends?.some((f) => f._id === u._id)}
                    hasSentRequest={sentRequests?.some((r) => r.to._id === u._id)}
                    isAdding={addingFriendId === u._id}
                    isCanceling={cancelingFriendId === u._id}
                    onAddFriend={handleAddFriend}
                    onCancelRequest={handleCancelRequest}
                    onViewProfile={setProfileUser}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}

          {profileUser && (
            <ProfileModal
              user={profileUser}
              isFriend={friends?.some((f) => f._id === profileUser._id)}
              hasSentRequest={sentRequests?.some((r) => r.to._id === profileUser._id)}
              isAdding={addingFriendId === profileUser._id}
              isCanceling={cancelingFriendId === profileUser._id}
              onAddFriend={handleAddFriend}
              onCancelRequest={handleCancelRequest}
              onClose={() => setProfileUser(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

/* Mobile row */
const UserRow = ({ user, isFriend, hasSentRequest, isAdding, isCanceling, onAddFriend, onCancelRequest, onViewProfile, index }) => (
  <div
    className="animate-fade-in"
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      animationDelay: `${index * 35}ms`,
      transition: 'border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-fire)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
  >
    <Avatar user={user} size={44} isFriend={isFriend} hasSentRequest={hasSentRequest} />

    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}
      </p>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.email}
      </p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); onViewProfile(user); }}
        className="btn-icon"
        title="View profile"
        style={{ width: 32, height: 32, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <Eye size={14} style={{ color: 'var(--text-secondary)' }} />
      </button>
      <ActionButton
        isFriend={isFriend}
        hasSentRequest={hasSentRequest}
        isLoading={isAdding || isCanceling}
        onClick={() => hasSentRequest ? onCancelRequest(user._id) : onAddFriend(user)}
        compact
      />
    </div>
  </div>
);

/* Desktop card */
const UserGridCard = ({ user, isFriend, hasSentRequest, isAdding, isCanceling, onAddFriend, onCancelRequest, onViewProfile, index }) => (
  <div
    className="animate-fade-in"
    style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      animationDelay: `${index * 35}ms`,
      transition: 'border-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-spring)',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-fire)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {/* Card top — gradient bg */}
    <div
      style={{
        padding: '24px 16px 16px',
        background: 'var(--bg-tertiary)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}
    >
      <Avatar user={user} size={64} isFriend={isFriend} hasSentRequest={hasSentRequest} large />
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </p>
      </div>
    </div>

    {/* Card bottom — action */}
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); onViewProfile(user); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-fire)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <Eye size={12} /> View Profile
      </button>
      <ActionButton
        isFriend={isFriend}
        hasSentRequest={hasSentRequest}
        isLoading={isAdding || isCanceling}
        onClick={() => hasSentRequest ? onCancelRequest(user._id) : onAddFriend(user)}
        full
      />
    </div>
  </div>
);

/* Avatar with status badge */
const Avatar = ({ user, size, isFriend, hasSentRequest, large }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: user.avatar ? 'transparent' : 'var(--gradient-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: large ? 22 : 16,
        overflow: 'hidden',
        boxShadow: large ? 'var(--shadow-violet)' : undefined,
      }}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : user.name?.charAt(0)?.toUpperCase()}
    </div>

    {/* Status badge */}
    {(isFriend || hasSentRequest) && (
      <div
        style={{
          position: 'absolute', top: -2, right: -2,
          width: large ? 22 : 18, height: large ? 22 : 18,
          borderRadius: '50%',
          background: isFriend ? 'var(--success)' : 'var(--warning)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg-secondary)',
        }}
      >
        {isFriend ? <Check size={large ? 12 : 10} color="#fff" strokeWidth={3} /> : <Clock size={large ? 12 : 10} color="#fff" strokeWidth={3} />}
      </div>
    )}
  </div>
);

/* Action button */
const ActionButton = ({ isFriend, hasSentRequest, isLoading, onClick, compact, full }) => {
  const baseStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 'var(--radius-lg)',
    fontSize: 13, fontWeight: 700,
    cursor: isFriend ? 'default' : 'pointer',
    width: full ? '100%' : undefined,
    padding: compact ? '6px 12px' : '8px 16px',
    transition: 'all var(--duration-fast) var(--ease-out)',
    border: '1px solid transparent',
  };

  if (isFriend) return (
    <div style={{ ...baseStyle, background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: 'var(--success)' }}>
      <Check size={13} strokeWidth={3} />
      {!compact && 'Friends'}
    </div>
  );

  if (hasSentRequest) return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={isLoading}
      style={{ ...baseStyle, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--warning)', opacity: isLoading ? 0.6 : 1 }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--warning)'; e.currentTarget.style.background = 'rgba(245,158,11,0.16)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'; e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }}
    >
      {isLoading ? <Spinner /> : <><X size={13} />{!compact && 'Cancel'}</>}
    </button>
  );

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={isLoading}
      className="btn-ember"
      style={{ ...baseStyle, opacity: isLoading ? 0.6 : 1, border: 'none' }}
    >
      {isLoading ? <Spinner /> : <><UserPlus size={13} />{!compact && 'Add Friend'}</>}
    </button>
  );
};

/* Profile modal */
const ProfileModal = ({ user, isFriend, hasSentRequest, isAdding, isCanceling, onAddFriend, onCancelRequest, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
  >
    <div
      className="animate-fade-in"
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%', maxWidth: 380,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Close button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
        <button
          onClick={onClose}
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--duration-fast) var(--ease-out)' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-fire)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 24, paddingInline: 24, gap: 10 }}>
        <div
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: user.avatar ? 'transparent' : 'var(--gradient-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 32,
            overflow: 'hidden',
            border: '4px solid var(--bg-secondary)',
            boxShadow: 'var(--shadow-violet)',
          }}
        >
          {user.avatar
            ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.name?.charAt(0)?.toUpperCase()}
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: 20 }}>{user.name}</p>
          {isFriend && (
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'rgba(34,197,94,0.1)', borderRadius: 100, padding: '2px 10px', display: 'inline-block', marginTop: 4 }}>
              Friends
            </span>
          )}
          {hasSentRequest && !isFriend && (
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', borderRadius: 100, padding: '2px 10px', display: 'inline-block', marginTop: 4 }}>
              Request sent
            </span>
          )}
        </div>

        {/* Details */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <Mail size={14} style={{ color: 'var(--text-fire)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
          </div>
          {user.createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Calendar size={14} style={{ color: 'var(--text-fire)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div style={{ width: '100%', marginTop: 4 }}>
          <ActionButton
            isFriend={isFriend}
            hasSentRequest={hasSentRequest}
            isLoading={isAdding || isCanceling}
            onClick={() => hasSentRequest ? onCancelRequest(user._id) : onAddFriend(user)}
            full
          />
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ searchTerm }) => (
  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 24px', gap: 10 }}>
    <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-xl)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fire)', marginBottom: 4 }}>
      <Search size={26} color="#fff" />
    </div>
    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>No users found</p>
    <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
      {searchTerm ? 'Try different search terms' : 'No users available right now'}
    </p>
  </div>
);

const Spinner = () => (
  <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
);