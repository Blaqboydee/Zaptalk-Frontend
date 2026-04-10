import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useGlobalSocket } from "../context/SocketContext";
import api from "../api/api";
import {
  User, Mail, MessageSquare, Camera,
  Upload, Trash2, Edit, Check, X, LogOut, Flame,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { logout, setProfile, profile, editForm, setEditForm, avatarPreview, setAvatarPreview, token } = useContext(AuthContext);

  const { socket } = useGlobalSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const handleEditToggle = () => {
    setIsEditing((v) => !v);
    if (!isEditing && profile) setEditForm({ name: profile.name, email: profile.email, bioStatus: profile.bioStatus });
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/users/profile", editForm, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.user);
      setIsEditing(false);
    } catch (err) { console.error(err); }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const res = await api.post("/users/upload-avatar", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data.user);
      setAvatarPreview(res.data.avatarUrl);
      setAvatarFile(null);
    } catch (err) { console.error(err); }
    finally { setIsUploadingAvatar(false); }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    try {
      const res = await api.delete("/users/delete-avatar", { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.user);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) { console.error(err); }
    finally { setIsDeletingAvatar(false); }
  };

  /* ── Loading ── */
  if (!profile) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width={52} height={52} viewBox="0 0 52 52" style={{ animation: 'spin 0.9s linear infinite' }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <circle cx="26" cy="26" r="22" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
              <circle cx="26" cy="26" r="22" fill="none" stroke="url(#psg)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 80" />
              <defs>
                <linearGradient id="psg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF5722" /><stop offset="100%" stopColor="#E91E63" />
                </linearGradient>
              </defs>
            </svg>
            <Flame size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--text-fire)' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15 }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  const isOnline = socket?.connected ?? false;

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--bg-base)' }}>

      {/* ── Fixed header ── */}
      <div
        className="page-header-fixed"
        style={{
          backgroundColor: 'rgba(15,13,24,0.92)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} style={{ color: 'var(--text-fire)' }} />
            <h1 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: 18, letterSpacing: '-0.03em' }}>Profile</h1>
          </div>
          <button
            onClick={() => { logout?.(); navigate("/login"); }}
            className="btn-ghost"
            style={{ padding: '7px 14px', fontSize: 13, color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--error)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ paddingTop: 'calc(88px + env(safe-area-inset-top))', paddingBottom: 48 }}>
        <div
          className="animate-fade-in"
          style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}
        >
          <style>{`@media(min-width:768px){.profile-grid{grid-template-columns:260px 1fr!important}}`}</style>

          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>

            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Avatar card */}
              <div className="card-ember" style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

                  {/* Avatar with hover overlay */}
                  <label htmlFor="avatarInput" style={{ cursor: 'pointer', position: 'relative', display: 'block' }}>
                    <div
                      style={{
                        width: 110, height: 110, borderRadius: 'var(--radius-xl)',
                        background: avatarPreview ? 'transparent' : 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-fire)',
                        color: '#fff', fontWeight: 900, fontSize: 36,
                        position: 'relative',
                      }}
                      className="group"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : profile.name?.charAt(0)?.toUpperCase() ?? 'U'}

                      {/* Hover overlay */}
                      <div
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.55)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                          opacity: 0,
                          transition: 'opacity var(--duration-fast) ease',
                          borderRadius: 'var(--radius-xl)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <Camera size={22} color="#fff" />
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Change</span>
                      </div>
                    </div>
                    <input id="avatarInput" type="file" accept="image/*" className="hidden"
                      onChange={(e) => { setAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} />
                  </label>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>{profile.name}</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{profile.email}</p>
                  </div>

                  {/* Upload button */}
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="btn-ember"
                      style={{ width: '100%', fontSize: 13, opacity: isUploadingAvatar ? 0.6 : 1 }}
                    >
                      {isUploadingAvatar ? <Spinner /> : <><Upload size={14} />Upload Photo</>}
                    </button>
                  )}

                  {/* Remove button */}
                  {(avatarPreview || profile.avatar) && !avatarFile && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar}
                      className="btn-ghost"
                      style={{ width: '100%', fontSize: 13, color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)', opacity: isDeletingAvatar ? 0.6 : 1 }}
                      onMouseEnter={(e) => { if (!isDeletingAvatar) e.currentTarget.style.borderColor = 'var(--error)'; }}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}
                    >
                      {isDeletingAvatar ? <Spinner /> : <><Trash2 size={14} />Remove Photo</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Status card */}
              <div className="card-ember" style={{ padding: 20 }}>
                <SectionLabel>Account</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>

                  {/* Online status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Status</span>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background: isOnline ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,120,0.1)',
                        border: `1px solid ${isOnline ? 'rgba(34,197,94,0.25)' : 'var(--border-color)'}`,
                        color: isOnline ? 'var(--success)' : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? 'var(--online-dot)' : 'var(--text-muted)', display: 'inline-block' }} />
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <InfoRow label="Joined" value={new Date(profile.createdAt).toLocaleDateString()} />
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="card-ember" style={{ overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 16 }}>Profile Information</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>Update your personal details</p>
                </div>
                {!isEditing && (
                  <button onClick={handleEditToggle} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>
                    <Edit size={14} />Edit
                  </button>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: 20 }}>
                {!isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <ProfileField icon={<User size={16} />} label="Full Name" value={profile.name} />
                    <ProfileField icon={<Mail size={16} />} label="Email Address" value={profile.email} />
                    <ProfileField icon={<MessageSquare size={16} />} label="Bio" value={`"${profile.bioStatus}"`} italic />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <EditField
                      label="Full Name" type="text" placeholder="Enter your name"
                      icon={<User size={15} style={{ color: 'var(--text-muted)' }} />}
                      value={editForm.name}
                      onChange={(v) => setEditForm({ ...editForm, name: v })}
                    />
                    <EditField
                      label="Email Address" type="email" placeholder="Enter your email"
                      icon={<Mail size={15} style={{ color: 'var(--text-muted)' }} />}
                      value={editForm.email}
                      onChange={(v) => setEditForm({ ...editForm, email: v })}
                    />
                    <div>
                      <FieldLabel>Bio</FieldLabel>
                      <div style={{ position: 'relative' }}>
                        <MessageSquare size={15} style={{ position: 'absolute', left: 13, top: 14, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <textarea
                          value={editForm.bioStatus}
                          onChange={(e) => setEditForm({ ...editForm, bioStatus: e.target.value })}
                          rows={3}
                          placeholder="Write something about yourself…"
                          className="input-ember scrollbar-hidden"
                          style={{ paddingLeft: 38, resize: 'none', fontSize: 14 }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                      <button onClick={handleSave} className="btn-ember" style={{ flex: 1, fontSize: 14 }}>
                        <Check size={15} />Save Changes
                      </button>
                      <button onClick={handleEditToggle} className="btn-ghost" style={{ padding: '11px 20px', fontSize: 14 }}>
                        <X size={15} />Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

const SectionLabel = ({ children }) => (
  <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
    {children}
  </p>
);

const FieldLabel = ({ children }) => (
  <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, marginBottom: 6, letterSpacing: '0.02em' }}>
    {children}
  </p>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{value}</span>
  </div>
);

const ProfileField = ({ icon, label, value, italic }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <span style={{ color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, fontStyle: italic ? 'italic' : 'normal', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  </div>
);

const EditField = ({ label, type, placeholder, icon, value, onChange }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-ember"
        style={{ paddingLeft: 38, fontSize: 14 }}
      />
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
);