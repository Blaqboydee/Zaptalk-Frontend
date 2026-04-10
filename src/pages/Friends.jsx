import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChatInitialization } from "../hooks/useChatInitialization";
import { useFriends } from "../hooks/useFriends.js";
import { useUsers } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import { useSocket } from "../hooks/useSocket";
import { useMessages } from "../hooks/useMessages";
import { useChats } from "../hooks/useChats";
import MobileChatModal from "../components/DirectChatsComponents/MobileChatModal.jsx";
import { useToast } from "../context/ToastContainer";
import { useGlobalSocket } from "../context/SocketContext.jsx";
import {
  Users, Inbox, Send, Trash2, UserPlus,
  MessageCircle, Check, X, Flame,
} from "lucide-react";

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(new Set());
  const [initializingChats, setInitializingChats] = useState(new Set());

  const {
    friends, friendRequests, sentRequests,
    addFriend, removeFriend, acceptFriendRequest,
    rejectFriendRequest, cancelFriendRequest,
  } = useFriends();

  const { socket } = useGlobalSocket();
  const { users } = useUsers();
  const { user } = useContext(AuthContext);
  const { isMobile } = useResponsive();
  const { chats, addChat } = useChats(user?.id);
  const { messages, isLoadingMessages, messagesEndRef, setMessages } = useMessages(selectedChatId);
  const { toast } = useToast();

  const { initChat } = useChatInitialization(
    user, chats, addChat, setSelectedChatId, setOtherUser,
    setMessages, isMobile, setIsOffcanvasOpen
  );

  const handleMessageReceived = useCallback(
    (message) => setMessages((prev) => [...prev, message]),
    [setMessages]
  );

  const { sendMessage: socketSendMessage } = useSocket(selectedChatId, handleMessageReceived);

  const sendMessage = useCallback((content) => {
    if (!content.trim() || !selectedChatId) return;
    socketSendMessage({ content, senderId: user.id, chatId: selectedChatId });
  }, [socketSendMessage, selectedChatId, user.id]);

  const handleMessageFriend = async (friend) => {
    if (!isMobile) { navigate("/allchats"); return; }
    setInitializingChats((prev) => new Set([...prev, friend._id]));
    try {
      await initChat(friend);
      if (isMobile && !isOffcanvasOpen) setIsChatModalOpen(true);
    } catch { toast.error("Failed to open chat"); }
    finally {
      setInitializingChats((prev) => { const s = new Set(prev); s.delete(friend._id); return s; });
    }
  };

  const handleSendFriendRequest = async (targetUser) => {
    setLoadingRequests((prev) => new Set([...prev, targetUser._id]));
    try { await addFriend(targetUser, user.name); }
    catch (err) { console.error(err); }
    finally {
      setLoadingRequests((prev) => { const s = new Set(prev); s.delete(targetUser._id); return s; });
    }
  };

  const isRequestSent  = (uid) => sentRequests.some((r) => r.to._id === uid);
  const isAlreadyFriend = (uid) => friends.some((f) => f._id === uid);
  const hasPendingRequest = (uid) => friendRequests.some((r) => r.from._id === uid);

  const TABS = [
    { key: "friends",  label: "Friends",    Icon: Users,    count: friends.length        },
    { key: "add",      label: "Add",        Icon: UserPlus, count: 0                     },
    { key: "requests", label: "Requests",   Icon: Inbox,    count: friendRequests.length },
    { key: "sent",     label: "Sent",       Icon: Send,     count: sentRequests.length   },
  ];

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-base)' }}>

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
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 20px 12px' }}>

          {/* Title */}
          <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
              <Users size={20} style={{ color: 'var(--text-fire)' }} />
              <h1 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>
                Connections
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage your friends and requests</p>
          </div>

          {/* Tab pills */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="tab-group" style={{ width: '100%', maxWidth: 480 }}>
              {TABS.map(({ key, label, Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`tab-pill ${activeTab === key ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{label}</span>
                  {count > 0 && (
                    <span
                      className="badge-fire"
                      style={{
                        background: activeTab === key ? 'rgba(255,255,255,0.25)' : undefined,
                        fontSize: 9,
                        minWidth: 16, height: 16,
                      }}
                    >
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ paddingTop: 'calc(136px + env(safe-area-inset-top))', paddingBottom: 40, minHeight: '100dvh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>

          {/* Friends */}
          {activeTab === "friends" && (
            <TabSection className="animate-fade-in">
              <TabHeading>Your Friends <Count>{friends.length}</Count></TabHeading>
              {friends.length === 0 ? (
                <EmptyState
                  Icon={Users}
                  title="No friends yet"
                  description="Start building your network by adding some friends!"
                  buttonText="Add Friends"
                  onClick={() => setActiveTab("add")}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {friends.map((f, i) => (
                    <PersonCard key={f._id} person={f} index={i} statusLabel={f.status?.state === 'online'}>
                      <button
                        onClick={() => handleMessageFriend(f)}
                        disabled={initializingChats.has(f._id)}
                        className="btn-ember"
                        style={{ padding: '7px 14px', fontSize: 13, opacity: initializingChats.has(f._id) ? 0.6 : 1 }}
                      >
                        {initializingChats.has(f._id) ? (
                          <Spinner />
                        ) : (
                          <><MessageCircle size={13} /><span className="hidden sm:inline">Message</span></>
                        )}
                      </button>
                      <button
                        onClick={() => removeFriend(f._id)}
                        className="btn-ghost"
                        style={{
                          padding: '7px 14px', fontSize: 13,
                          color: 'var(--error)',
                          borderColor: 'rgba(239,68,68,0.3)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--error)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}
                      >
                        <Trash2 size={13} /><span className="hidden sm:inline">Remove</span>
                      </button>
                    </PersonCard>
                  ))}
                </div>
              )}
            </TabSection>
          )}

          {/* Add Friends */}
          {activeTab === "add" && (
            <TabSection className="animate-fade-in">
              <TabHeading>Discover People</TabHeading>
              {users.length === 0 ? (
                <EmptyState Icon={UserPlus} title="No users found" description="Check back later for more people to connect with!" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {users.map((u, i) => {
                    const loading    = loadingRequests.has(u._id);
                    const isFriend   = isAlreadyFriend(u._id);
                    const pending    = hasPendingRequest(u._id);
                    const sent       = isRequestSent(u._id);

                    return (
                      <PersonCard
                        key={u._id} person={u} index={i}
                        subtitle={isFriend ? 'Already friends' : pending ? 'Wants to connect' : u.email}
                      >
                        {isFriend && (
                          <span className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13, color: 'var(--success)', borderColor: 'rgba(34,197,94,0.3)', cursor: 'default' }}>
                            <Check size={13} /> Friends
                          </span>
                        )}
                        {pending && (
                          <button
                            onClick={() => acceptFriendRequest(u._id, u.name)}
                            className="btn-ember"
                            style={{ padding: '7px 14px', fontSize: 13, background: 'var(--gradient-secondary)' }}
                          >
                            <Check size={13} /> Accept
                          </button>
                        )}
                        {sent && !isFriend && !pending && (
                          <span className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13, cursor: 'default' }}>
                            <Check size={13} /> Sent
                          </span>
                        )}
                        {!isFriend && !pending && !sent && (
                          <button
                            onClick={() => handleSendFriendRequest(u)}
                            disabled={loading}
                            className="btn-ember"
                            style={{ padding: '7px 14px', fontSize: 13, opacity: loading ? 0.6 : 1 }}
                          >
                            {loading ? <Spinner /> : <><UserPlus size={13} /><span className="hidden sm:inline">Add</span></>}
                          </button>
                        )}
                      </PersonCard>
                    );
                  })}
                </div>
              )}
            </TabSection>
          )}

          {/* Requests */}
          {activeTab === "requests" && (
            <TabSection className="animate-fade-in">
              <TabHeading>Friend Requests <Count>{friendRequests.length}</Count></TabHeading>
              {friendRequests.length === 0 ? (
                <EmptyState Icon={Inbox} title="No pending requests" description="You're all caught up! New requests will appear here." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {friendRequests.map((r, i) => (
                    <PersonCard key={r._id} person={r.from} index={i} subtitle="Wants to connect">
                      <button
                        onClick={() => acceptFriendRequest(r.from._id, r.from.name)}
                        className="btn-ember"
                        style={{ padding: '7px 14px', fontSize: 13 }}
                      >
                        <Check size={13} /><span className="hidden sm:inline">Accept</span>
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(r.from._id, r.from.name)}
                        className="btn-ghost"
                        style={{ padding: '7px 14px', fontSize: 13 }}
                      >
                        <X size={13} /><span className="hidden sm:inline">Decline</span>
                      </button>
                    </PersonCard>
                  ))}
                </div>
              )}
            </TabSection>
          )}

          {/* Sent */}
          {activeTab === "sent" && (
            <TabSection className="animate-fade-in">
              <TabHeading>Sent Requests <Count>{sentRequests.length}</Count></TabHeading>
              {sentRequests.length === 0 ? (
                <EmptyState
                  Icon={Send} title="No sent requests"
                  description="Start connecting with people by sending friend requests!"
                  buttonText="Find People" onClick={() => setActiveTab("add")}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sentRequests.map((r, i) => (
                    <PersonCard key={r._id} person={r.to} index={i} subtitle="Request pending">
                      <button
                        onClick={() => cancelFriendRequest(r.to._id)}
                        className="btn-ghost"
                        style={{
                          padding: '7px 14px', fontSize: 13,
                          color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--error)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}
                      >
                        <X size={13} /><span className="hidden sm:inline">Cancel</span>
                      </button>
                    </PersonCard>
                  ))}
                </div>
              )}
            </TabSection>
          )}
        </div>
      </div>

      <MobileChatModal
        isOpen={isChatModalOpen || isOffcanvasOpen}
        onClose={() => { setIsChatModalOpen(false); setOtherUser(null); setMessages([]); setIsOffcanvasOpen(false); }}
        selectedChatId={selectedChatId}
        otherUser={otherUser}
        messages={messages}
        user={user}
        isLoadingMessages={isLoadingMessages}
        messagesEndRef={messagesEndRef}
        onSendMessage={sendMessage}
        isMobile={isMobile}
        friends={friends}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────── */

const TabSection = ({ children }) => (
  <div style={{ paddingTop: 8 }}>{children}</div>
);

const TabHeading = ({ children }) => (
  <h2 style={{
    color: 'var(--text-primary)', fontWeight: 800, fontSize: 16,
    letterSpacing: '-0.02em', marginBottom: 14,
  }}>
    {children}
  </h2>
);

const Count = ({ children }) => (
  <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 14 }}>
    {' '}({children})
  </span>
);

const PersonCard = ({ person, index, subtitle, statusLabel, children }) => (
  <div
    className="animate-fade-in"
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '12px 14px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      animationDelay: `${index * 40}ms`,
      transition: 'border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-fire)';
      e.currentTarget.style.background = 'var(--bg-hover)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-color)';
      e.currentTarget.style.background = 'var(--bg-secondary)';
    }}
  >
    {/* Avatar + info */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: person.avatar ? 'transparent' : 'var(--gradient-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16, overflow: 'hidden',
          }}
        >
          {person.avatar ? (
            <img src={person.avatar} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : person.name?.charAt(0)?.toUpperCase()}
        </div>
        {/* Status dot */}
        <span
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 11, height: 11, borderRadius: '50%',
            background: person.status?.state === 'online' ? 'var(--online-dot)' : 'var(--text-muted)',
            border: '2px solid var(--bg-secondary)',
          }}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {person.name}
        </p>
        <p style={{
          fontSize: 12, fontWeight: 500,
          color: statusLabel !== undefined
            ? (person.status?.state === 'online' ? 'var(--success)' : 'var(--text-muted)')
            : 'var(--text-tertiary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {statusLabel !== undefined
            ? (person.status?.state === 'online' ? '● Online' : 'Offline')
            : subtitle}
        </p>
      </div>
    </div>

    {/* Action buttons */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      {children}
    </div>
  </div>
);

const EmptyState = ({ Icon, title, description, buttonText, onClick }) => (
  <div
    className="animate-fade-in"
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '56px 24px', gap: 10,
    }}
  >
    <div
      style={{
        width: 60, height: 60, borderRadius: 'var(--radius-xl)',
        background: 'var(--gradient-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-fire)', marginBottom: 4,
      }}
    >
      <Icon size={26} color="#fff" />
    </div>
    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>{title}</p>
    <p style={{ color: 'var(--text-tertiary)', fontSize: 13, maxWidth: 280 }}>{description}</p>
    {buttonText && onClick && (
      <button className="btn-ember" onClick={onClick} style={{ marginTop: 8, fontSize: 13 }}>
        {buttonText}
      </button>
    )}
  </div>
);

const Spinner = () => (
  <div
    style={{
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      animation: 'spin 0.8s linear infinite',
    }}
  />
);