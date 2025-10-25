import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
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
  Users, 
  Inbox, 
  Send, 
  Trash2, 
  UserPlus, 
  MessageCircle,
  Zap,
  Check,
  X
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");

  // Modal state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // Loading states
  const [loadingRequests, setLoadingRequests] = useState(new Set());
  const [initializingChats, setInitializingChats] = useState(new Set());

  const {
    friends,
    friendRequests,
    sentRequests,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    loading,
    error,
  } = useFriends();

  const { socket } = useGlobalSocket();
  const { users } = useUsers();
  const { user } = useContext(AuthContext);
  const id = user.id;
  const { isMobile } = useResponsive();
  const { chats, addChat } = useChats(user?.id);

  const { messages, isLoadingMessages, messagesEndRef, setMessages } =
    useMessages(selectedChatId);

  const { toast } = useToast();

  const { initChat, isInitializing } = useChatInitialization(
    user,
    chats,
    addChat,
    setSelectedChatId,
    setOtherUser,
    setMessages,
    isMobile,
    setIsOffcanvasOpen
  );

  const handleMessageReceived = useCallback(
    (message) => {
      setMessages((prev) => [...prev, message]);
    },
    [setMessages]
  );

  const { sendMessage: socketSendMessage } = useSocket(
    selectedChatId,
    handleMessageReceived
  );

  const sendMessage = useCallback(
    (messageContent) => {
      if (!messageContent.trim() || !selectedChatId) return;

      socketSendMessage({
        content: messageContent,
        senderId: user.id,
        chatId: selectedChatId,
      });
    },
    [socketSendMessage, selectedChatId, user.id]
  );

  const handleMessageFriend = async (friend) => {
    if (!isMobile) {
      navigate("/allchats");
      return;
    }

    setInitializingChats((prev) => new Set([...prev, friend._id]));

    try {
      await initChat(friend);
      if (isMobile && !isOffcanvasOpen) {
        setIsChatModalOpen(true);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
      toast.error("Failed to open chat");
    } finally {
      setInitializingChats((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friend._id);
        return newSet;
      });
    }
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setOtherUser(null);
    setMessages([]);
    setIsOffcanvasOpen(false);
  };

  const handleSendFriendRequest = async (targetUser) => {
    setLoadingRequests((prev) => new Set([...prev, targetUser._id]));

    try {
      await addFriend(targetUser, user.name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetUser._id);
        return newSet;
      });
    }
  };

  const isRequestSent = (userId) => {
    return sentRequests.some((request) => request.to._id === userId);
  };

  const isAlreadyFriend = (userId) => {
    return friends.some((friend) => friend._id === userId);
  };

  const hasPendingRequest = (userId) => {
    return friendRequests.some((request) => request.from._id === userId);
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case "friends":
        return friends.length;
      case "requests":
        return friendRequests.length;
      case "sent":
        return sentRequests.length;
      default:
        return 0;
    }
  };

  const getTabInfo = (key) => {
    const tabMap = {
      friends: {
        label: "Friends",
        icon: <Users className="w-5 h-5" />,
      },
      add: { 
        label: "Add Friends", 
        icon: <UserPlus className="w-5 h-5" /> 
      },
      requests: { 
        label: "Requests", 
        icon: <Inbox className="w-5 h-5" /> 
      },
      sent: { 
        label: "Sent", 
        icon: <Send className="w-5 h-5" /> 
      },
    };
    return tabMap[key];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F0F1A' }}>
      {/* Fixed Header Section */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
        style={{ 
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          borderBottom: '1px solid #2D2640'
        }}
      >
        <div className="w-full lg:max-w-6xl flex items-center justify-center flex-col mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="mb-4 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-6 h-6" style={{ color: '#22D3EE' }} />
              <h1 className="text-xl lg:text-3xl font-bold text-white">
                Connections
              </h1>
            </div>
            <p className="text-sm lg:text-base" style={{ color: '#A1A1AA' }}>
              Manage your friends and requests
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="w-full flex justify-center">
            <div 
              className="rounded-xl p-1 flex justify-between w-full lg:w-[60%] sm:w-full overflow-x-auto"
              style={{ backgroundColor: '#1A1625' }}
            >
              {["friends", "add", "requests", "sent"].map((tab) => {
                const tabInfo = getTabInfo(tab);
                const isActive = activeTab === tab;
                const count = getTabCount(tab);

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? '#8B5CF6' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#A1A1AA'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#252032';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#A1A1AA';
                      }
                    }}
                  >
                    <span>{tabInfo.icon}</span>
                    <span className="text-sm hidden sm:inline">
                      {tabInfo.label}
                    </span>

                    {count > 0 && (
                      <span
                        className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full"
                        style={{
                          backgroundColor: isActive ? '#FFFFFF' : '#8B5CF6',
                          color: isActive ? '#8B5CF6' : '#FFFFFF'
                        }}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with top padding */}
      <div className="w-full h-screen overflow-auto">
        <div className="pt-44 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="min-h-[500px]">
              {/* Friends Tab */}
              {activeTab === "friends" && (
                <div className="p-4 lg:p-6 animate-fade-in">
                  <div className="mb-4 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Your Friends ({friends.length})
                    </h2>
                  </div>

                  {friends?.length === 0 ? (
                    <EmptyState
                      icon={<Users className="w-10 h-10" style={{ color: '#71717A' }} />}
                      title="No friends yet"
                      description="Start building your network by adding some friends!"
                      buttonText="Add Friends"
                      onClick={() => setActiveTab("add")}
                    />
                  ) : (
                    <div className="space-y-3">
                      {friends?.map((f, index) => (
                        <div
                          key={f?._id}
                          className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                          style={{ 
                            backgroundColor: '#1A1625',
                            border: '1px solid #2D2640',
                            animationDelay: `${index * 50}ms`
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B5CF6'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D2640'}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="relative flex-shrink-0">
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                                  style={{ 
                                    backgroundColor: f?.avatar ? 'transparent' : '#8B5CF6' 
                                  }}
                                >
                                  {f?.avatar ? (
                                    <img
                                      src={f.avatar}
                                      alt={f.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    f.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div
                                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                                  style={{
                                    backgroundColor: f.status?.state === "online" ? '#10B981' : '#71717A',
                                    border: '2px solid #1A1625'
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm lg:text-base font-semibold text-white truncate">
                                  {f.name}
                                </h3>
                                <p 
                                  className="text-sm"
                                  style={{ 
                                    color: f.status?.state === "online" ? '#22D3EE' : '#71717A' 
                                  }}
                                >
                                  {f.status?.state === "online" ? "Online" : "Offline"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                              <button
                                onClick={() => handleMessageFriend(f)}
                                disabled={initializingChats.has(f._id)}
                                className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                style={{
                                  backgroundColor: initializingChats.has(f._id) ? '#7C3AED' : '#8B5CF6',
                                  color: '#FFFFFF',
                                  cursor: initializingChats.has(f._id) ? 'not-allowed' : 'pointer'
                                }}
                                title="Message"
                              >
                                {initializingChats.has(f._id) ? (
                                  <>
                                    <div 
                                      className="w-4 h-4 rounded-full animate-spin"
                                      style={{ 
                                        border: '2px solid #FFFFFF',
                                        borderTopColor: 'transparent'
                                      }}
                                    />
                                    <span className="hidden sm:inline text-sm">
                                      Opening...
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-4 h-4 sm:hidden" />
                                    <span className="hidden sm:inline text-sm">
                                      Message
                                    </span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => removeFriend(f._id)}
                                className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.5)',
                                  color: '#EF4444'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                  e.currentTarget.style.borderColor = '#EF4444';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                }}
                                title="Remove friend"
                              >
                                <Trash2 className="w-4 h-4 sm:hidden" />
                                <span className="hidden sm:inline text-sm">
                                  Remove
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Friend Tab */}
              {activeTab === "add" && (
                <div className="p-4 lg:p-6 animate-fade-in">
                  <div className="mb-4 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Discover People
                    </h2>
                  </div>

                  {users.length === 0 ? (
                    <EmptyState
                      icon={<UserPlus className="w-10 h-10" style={{ color: '#71717A' }} />}
                      title="No users found"
                      description="Check back later for more people to connect with!"
                    />
                  ) : (
                    <div className="space-y-3">
                      {users.map((u, index) => {
                        const isLoading = loadingRequests.has(u._id);
                        const requestSent = isRequestSent(u._id);
                        const isFriend = isAlreadyFriend(u._id);
                        const pendingRequest = hasPendingRequest(u._id);

                        return (
                          <UserCard
                            key={u._id}
                            user={u}
                            isLoading={isLoading}
                            isFriend={isFriend}
                            pendingRequest={pendingRequest}
                            requestSent={requestSent}
                            onAddFriend={() => handleSendFriendRequest(u)}
                            onAccept={() => acceptFriendRequest(u._id, u.name)}
                            index={index}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Friend Requests Tab */}
              {activeTab === "requests" && (
                <div className="p-4 lg:p-6 animate-fade-in">
                  <div className="mb-4 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Friend Requests ({friendRequests.length})
                    </h2>
                  </div>

                  {friendRequests.length === 0 ? (
                    <EmptyState
                      icon={<Inbox className="w-10 h-10" style={{ color: '#71717A' }} />}
                      title="No pending requests"
                      description="You're all caught up! New friend requests will appear here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {friendRequests.map((r, index) => (
                        <RequestCard
                          key={r._id}
                          request={r}
                          onAccept={() => acceptFriendRequest(r.from._id, r.from.name)}
                          onReject={() => rejectFriendRequest(r.from._id, r.from.name)}
                          index={index}
                          type="received"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sent Requests Tab */}
              {activeTab === "sent" && (
                <div className="p-4 lg:p-6 animate-fade-in">
                  <div className="mb-4 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Sent Requests ({sentRequests.length})
                    </h2>
                  </div>

                  {sentRequests.length === 0 ? (
                    <EmptyState
                      icon={<Send className="w-10 h-10" style={{ color: '#71717A' }} />}
                      title="No sent requests"
                      description="Start connecting with people by sending friend requests!"
                      buttonText="Find People"
                      onClick={() => setActiveTab("add")}
                    />
                  ) : (
                    <div className="space-y-3">
                      {sentRequests.map((r, index) => (
                        <RequestCard
                          key={r._id}
                          request={r}
                          onCancel={() => cancelFriendRequest(r.to._id)}
                          index={index}
                          type="sent"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileChatModal
        isOpen={isChatModalOpen || isOffcanvasOpen}
        onClose={closeChatModal}
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

// Empty State Component
const EmptyState = ({ icon, title, description, buttonText, onClick }) => (
  <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
    <div 
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
      style={{ backgroundColor: '#1A1625' }}
    >
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-center max-w-sm mb-6" style={{ color: '#A1A1AA' }}>
      {description}
    </p>
    {buttonText && onClick && (
      <button
        onClick={onClick}
        className="px-6 py-2.5 font-medium rounded-xl transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
      >
        {buttonText}
      </button>
    )}
  </div>
);

// User Card Component
const UserCard = ({ user, isLoading, isFriend, pendingRequest, requestSent, onAddFriend, onAccept, index }) => {
  let buttonConfig = {};

  if (isFriend) {
    buttonConfig = {
      text: "Friends",
      disabled: true,
      style: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.5)',
        color: '#10B981',
        cursor: 'not-allowed'
      },
      icon: <Check className="w-4 h-4" />
    };
  } else if (pendingRequest) {
    buttonConfig = {
      text: "Accept",
      disabled: false,
      style: {
        backgroundColor: '#22D3EE',
        color: '#FFFFFF'
      },
      onClick: onAccept,
      icon: <Check className="w-4 h-4" />
    };
  } else if (requestSent) {
    buttonConfig = {
      text: "Sent",
      disabled: true,
      style: {
        backgroundColor: '#252032',
        color: '#A1A1AA',
        cursor: 'not-allowed'
      },
      icon: <Check className="w-4 h-4" />
    };
  } else {
    buttonConfig = {
      text: isLoading ? "" : "Add",
      disabled: isLoading,
      style: {
        backgroundColor: isLoading ? '#7C3AED' : '#8B5CF6',
        color: '#FFFFFF',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      },
      onClick: onAddFriend,
      icon: <UserPlus className="w-4 h-4" />
    };
  }

  return (
    <div
      className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
      style={{ 
        backgroundColor: '#1A1625',
        border: '1px solid #2D2640',
        animationDelay: `${index * 50}ms`
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B5CF6'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D2640'}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: user.avatar ? 'transparent' : '#8B5CF6' }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm lg:text-base font-semibold text-white truncate">
              {user.name}
            </h3>
            <p className="text-xs lg:text-sm truncate" style={{ color: '#A1A1AA' }}>
              {isFriend ? "Friend" : pendingRequest ? "Wants to be your friend" : user.email}
            </p>
          </div>
        </div>

        <button
          onClick={buttonConfig.onClick}
          disabled={buttonConfig.disabled}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          style={buttonConfig.style}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full animate-spin"
                style={{ 
                  border: '2px solid #FFFFFF',
                  borderTopColor: 'transparent'
                }}
              />
              <span className="hidden sm:inline text-sm">Sending...</span>
            </div>
          ) : (
            <>
              <span className="hidden sm:inline text-sm">{buttonConfig.text}</span>
              {buttonConfig.icon}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onAccept, onReject, onCancel, index, type }) => {
  const userData = type === "sent" ? request.to : request.from;

  return (
    <div
      className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
      style={{ 
        backgroundColor: '#1A1625',
        border: '1px solid #2D2640',
        animationDelay: `${index * 50}ms`
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B5CF6'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D2640'}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: userData.avatar ? 'transparent' : '#8B5CF6' }}
          >
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              userData.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm lg:text-base font-semibold text-white truncate">
              {userData.name}
            </h3>
            {type === "sent" && (
              <p className="text-xs lg:text-sm" style={{ color: '#A1A1AA' }}>
                Request pending
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {type === "received" ? (
            <>
              <button
                onClick={onAccept}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Accept</span>
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: '#252032', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Decline</span>
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#EF4444'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};