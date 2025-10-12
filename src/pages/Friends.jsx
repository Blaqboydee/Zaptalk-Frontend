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
import { FaUserFriends, FaInbox, FaPaperPlane, FaTrash } from "react-icons/fa";
import { MdPersonAdd, MdMessage } from "react-icons/md";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");

  // Modal state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // Loading state for friend requests
  const [loadingRequests, setLoadingRequests] = useState(new Set());
  // Loading state for message buttons
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

  // Handle message friend - Desktop routes to /chats, Mobile opens modal
  const handleMessageFriend = async (friend) => {
    if (!isMobile) {
      // Desktop: Navigate to chats page
      navigate("/allchats");
      return;
    }

    // Mobile: Open modal
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
        icon: <FaUserFriends className="w-5 h-5" />,
      },
      add: { label: "Add Friends", icon: <MdPersonAdd className="w-5 h-5" /> },
      requests: { label: "Requests", icon: <FaInbox className="w-5 h-5" /> },
      sent: { label: "Sent", icon: <FaPaperPlane className="w-5 h-5" /> },
    };
    return tabMap[key];
  };

  return (
    <div className="min-h-screen">
      {/* Fixed Header Section */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 flex  backdrop-blur-md border-b border-gray-800">
        <div className="w-full lg:max-w-6xl flex items-center justify-center flex-col mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="text-xl lg:text-3xl font-bold text-white mb-2">Connections</h1>
            <p className="text-sm lg:text-base text-gray-400">Manage your friends and requests</p>
          </div>

          {/* Tab Navigation */}
          <div className="w-full flex justify-center">
            <div className="bg-gray-800 rounded-xl p-1 flex justify-between w-full lg:w-[60%] sm:w-full overflow-x-auto">
              {["friends", "add", "requests", "sent"].map((tab) => {
                const tabInfo = getTabInfo(tab);
                const isActive = activeTab === tab;
                const count = getTabCount(tab);

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <span>{tabInfo.icon}</span>
                    <span className="text-sm hidden sm:inline">
                      {tabInfo.label}
                    </span>

                    {count > 0 && (
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
                          isActive
                            ? "bg-white text-orange-500"
                            : "bg-orange-500 text-white"
                        }`}
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
            <div className="bg-gray-800 rounded-xl border border-gray-700 min-h-[500px]">
              {/* Friends Tab */}
              {activeTab === "friends" && (
                <div className="p-4 lg:p-6">
                  <div className="mb-2 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Your Friends ({friends.length})
                    </h2>
                  </div>

                  {friends?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                        <FaUserFriends className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No friends yet
                      </h3>
                      <p className="text-gray-400 mb-6 text-center max-w-sm">
                        Start building your network by adding some friends!
                      </p>
                      <button
                        onClick={() => setActiveTab("add")}
                        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Add Friends
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends?.map((f) => (
                        <div
                          key={f?._id}
                          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="relative flex-shrink-0">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                    f?.avatar ? "" : "bg-orange-500"
                                  }`}
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
                                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${
                                    f.status?.state === "online"
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                                  } rounded-full border-2 border-gray-900`}
                                ></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm lg:text-base font-semibold text-white truncate">
                                  {f.name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {f.status?.state === "online"
                                    ? "Online"
                                    : "Offline"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                              <button
                                onClick={() => handleMessageFriend(f)}
                                disabled={initializingChats.has(f._id)}
                                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                  initializingChats.has(f._id)
                                    ? "bg-orange-400 text-white cursor-not-allowed"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                }`}
                                title="Message"
                              >
                                {initializingChats.has(f._id) ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="hidden sm:inline text-sm">
                                      Opening...
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <MdMessage className="w-4 h-4 sm:hidden" />
                                    <span className="hidden sm:inline text-sm">
                                      Message
                                    </span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => removeFriend(f._id)}
                                className="flex items-center justify-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 font-medium transition-colors"
                                title="Remove friend"
                              >
                                <FaTrash className="w-4 h-4 sm:hidden" />
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
               <div className="p-4 lg:p-6">
                  <div className="mb-2 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Discover People
                    </h2>
                  </div>

                  {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 ">
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                        <MdPersonAdd className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-400">
                        Check back later for more people to connect with!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((u) => {
                        const isLoading = loadingRequests.has(u._id);
                        const requestSent = isRequestSent(u._id);
                        const isFriend = isAlreadyFriend(u._id);
                        const pendingRequest = hasPendingRequest(u._id);

                        let buttonConfig = {};

                        if (isFriend) {
                          buttonConfig = {
                            text: "Friends",
                            disabled: true,
                            className:
                              "px-4 py-2 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg cursor-not-allowed text-sm font-medium",
                          };
                        } else if (pendingRequest) {
                          buttonConfig = {
                            text: "Accept",
                            disabled: false,
                            className:
                              "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium",
                            onClick: () => acceptFriendRequest(u._id, u.name),
                          };
                        } else if (requestSent) {
                          buttonConfig = {
                            text: "Sent",
                            disabled: true,
                            className:
                              "px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium",
                          };
                        } else {
                          buttonConfig = {
                            text: isLoading ? "" : "Add",
                            disabled: isLoading,
                            className: `px-4 py-2 ${
                              isLoading
                                ? "bg-orange-400 cursor-not-allowed"
                                : "bg-orange-500 hover:bg-orange-600"
                            } text-white rounded-lg transition-colors text-sm font-medium`,
                            onClick: () => handleSendFriendRequest(u),
                          };
                        }

                        return (
                          <div
                            key={u._id}
                            className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                                    u.avatar ? "" : "bg-blue-500"
                                  }`}
                                >
                                  {u.avatar ? (
                                    <img
                                      src={u.avatar}
                                      alt={u.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    u.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm lg:text-base font-semibold text-white truncate">
                                    {u.name}
                                  </h3>
                                  <p className="text-xs lg:text-sm text-gray-400 truncate">
                                    {isFriend
                                      ? "Friend"
                                      : pendingRequest
                                      ? "Wants to be your friend"
                                      : u.email}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={buttonConfig.onClick}
                                disabled={buttonConfig.disabled}
                                className={buttonConfig.className}
                              >
                                {isLoading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="hidden sm:inline">
                                      Sending...
                                    </span>
                                  </div>
                                ) : (
                                  buttonConfig.text
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Friend Requests Tab */}
              {activeTab === "requests" && (
               <div className="p-4 lg:p-6">
                  <div className="mb-2 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Friend Requests ({friendRequests.length})
                    </h2>
                  </div>

                  {friendRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                        <FaInbox className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No pending requests
                      </h3>
                      <p className="text-gray-400">
                        You're all caught up! New friend requests will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friendRequests.map((r) => (
                        <div
                          key={r._id}
                          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                                  r.from.avatar ? "" : "bg-green-500"
                                }`}
                              >
                                {r.from.avatar ? (
                                  <img
                                    src={r.from.avatar}
                                    alt={r.from.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  r.from.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm lg:text-base font-semibold text-white truncate">
                                  {r.from.name}
                                </h3>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                              <button
                                onClick={() =>
                                  acceptFriendRequest(r.from._id, r.from.name)
                                }
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  rejectFriendRequest(r.from._id, r.from.name)
                                }
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sent Requests Tab */}
              {activeTab === "sent" && (
                     <div className="p-4 lg:p-6">
                  <div className="mb-2 lg:mb-6">
                    <h2 className="text-sm lg:text-xl font-semibold text-white">
                      Sent Requests ({sentRequests.length})
                    </h2>
                  </div>

                  {sentRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                        <FaPaperPlane className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No sent requests
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Start connecting with people by sending friend requests!
                      </p>
                      <button
                        onClick={() => setActiveTab("add")}
                        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Find People
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sentRequests.map((r) => (
                        <div
                          key={r._id}
                          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                                  r.to.avatar ? "" : "bg-purple-500"
                                }`}
                              >
                                {r.to.avatar ? (
                                  <img
                                    src={r.to.avatar}
                                    alt={r.to.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  r.to.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm lg:text-base font-semibold text-white truncate">
                                  {r.to.name}
                                </h3>
                                <p className="text-xs lg:text-sm text-gray-400">
                                  Request pending
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => cancelFriendRequest(r.to._id)}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
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


         {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Custom Scrollbar for Webkit browsers */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
          border: 2px solid #1f2937;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }

        ::-webkit-scrollbar-thumb:active {
          background: #f97316;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #374151 #1f2937;
        }
      `}</style>
    </div>
  );
}
