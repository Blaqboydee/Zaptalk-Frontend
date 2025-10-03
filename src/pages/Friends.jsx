import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useChatInitialization } from "../hooks/useChatInitialization";
import { useFriends } from "../hooks/useFriends.js";
import { useUsers } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import { useSocket } from "../hooks/useSocket";
import { useMessages } from "../hooks/useMessages";
import { useChats } from "../hooks/useChats";
import MobileChatModal from "../components/MobileChatModal";
import { useToast } from "../context/ToastContainer";
import { useGlobalSocket } from "../context/SocketContext.jsx";
import { FaUserFriends } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import { FaInbox, FaPaperPlane } from "react-icons/fa"; 
import { MdGroup } from "react-icons/md";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Friends() {
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

  // Use the simplified hook that gets everything from Socket context
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
    error 
  } = useFriends();

  // Get direct access to Socket context for any additional functionality
  const { socket } = useGlobalSocket();

  const { users } = useUsers();
  const { user } = useContext(AuthContext);
  const id = user.id;
  const { isMobile } = useResponsive();
  const { chats, addChat } = useChats(user?.id);
  
  // Messages hook for the selected chat
  const {
    messages,
    isLoadingMessages,
    messagesEndRef,
    setMessages,
  } = useMessages(selectedChatId);

  const { toast } = useToast();

  // Initialize the chat initialization hook
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

  // Socket hook for real-time messaging
  const handleMessageReceived = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, [setMessages]);

  const { sendMessage: socketSendMessage } = useSocket(
    selectedChatId,
    handleMessageReceived
  );

  // Handle sending messages
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

  // Updated handler using initChat
  const handleMessageFriend = async (friend) => {
    // Add friend to initializing set
    setInitializingChats(prev => new Set([...prev, friend._id]));
    
    try {
      await initChat(friend);
      // Open modal for mobile if not already handled by initChat
      if (isMobile && !isOffcanvasOpen) {
        setIsChatModalOpen(true);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    } finally {
      // Remove friend from initializing set
      setInitializingChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(friend._id);
        return newSet;
      });
    }
  };

  // Close modal handler
  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setOtherUser(null);
    setMessages([]);
    setIsOffcanvasOpen(false);
  };

  // Handle sending friend request - simplified
  const handleSendFriendRequest = async (targetUser) => {
    // Add user to loading set
    setLoadingRequests(prev => new Set([...prev, targetUser._id]));
    
    try {
      await addFriend(targetUser, user.name);
    } catch (err) {
      console.error(err);
      // Error toast is handled in the Socket context
    } finally {
      // Remove user from loading set
      setLoadingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUser._id);
        return newSet;
      });
    }
  };

  // Helper function to check if request already sent
  const isRequestSent = (userId) => {
    return sentRequests.some(request => request.to._id === userId);
  };

  // Helper function to check if user is already a friend
  const isAlreadyFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };

  // Helper function to check if there's a pending incoming request
  const hasPendingRequest = (userId) => {
    return friendRequests.some(request => request.from._id === userId);
  };

  const getTabCount = (tab) => {
    switch(tab) {
      case 'friends': return friends.length;
      case 'requests': return friendRequests.length;
      case 'sent': return sentRequests.length;
      default: return 0;
    }
  };

  // Get tab info with labels
  const getTabInfo = (key) => {
    const tabMap = {
      friends: { label: "Friends", icon: <FaUserFriends className="w-5 h-5" /> },
      add: { label: "Add Friends", icon: <MdPersonAdd className="w-5 h-5" /> },
      requests: { label: "Requests", icon: <FaInbox className="w-5 h-5" /> },
      sent: { label: "Sent", icon: <FaPaperPlane className="w-5 h-5" /> }
    };
    return tabMap[key];
  };

  return (
    <div className="h-[100vh] bg-gray-900 flex flex-col overflow-hidden pt-12">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-slate-700/50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            

          </div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              {["friends", "add", "requests", "sent"].map((tab) => {
                const tabInfo = getTabInfo(tab);
                const isActive = activeTab === tab;
                const count = getTabCount(tab);
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                      isActive
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-500/25 scale-105"
                        : "text-slate-400 hover:text-white hover:bg-gray-700/50 hover:scale-102"
                    }`}
                  >
                    <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                      {tabInfo.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-medium hidden sm:block">
                      {tabInfo.label}
                    </span>
                    
                    {/* Enhanced count badge */}
                    {count > 0 && (
                      <span className={`absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs font-bold rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-white text-orange-600 shadow-lg' 
                          : 'bg-orange-600 text-white'
                      }`}>
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl min-h-[calc(100vh-16rem)]">
              
              {/* Friends Tab */}
              {activeTab === "friends" && (
                <div className="p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-orange-600/20 rounded-lg">
                        <FaUserFriends className="w-5 h-5 text-orange-400" />
                      </div>
                      Your Friends
                      <span className="text-slate-400 text-lg">({friends.length})</span>
                    </h2>
                  </div>
                  
                  {friends?.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-orange-600/20 rounded-full flex items-center justify-center">
                        <FaUserFriends className="w-12 h-12 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No friends yet</h3>
                      <p className="text-slate-400 mb-4">Start building your network by adding some friends!</p>
                      <button 
                        onClick={() => setActiveTab('add')}
                        className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
                      >
                        Add Friends
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4">
                      {friends?.map(f => (
                        <div key={f?._id} className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 hover:border-orange-500/30 hover:bg-gray-700/40 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                  f?.avatar ? '' : 'bg-orange-600'
                                }`}>
                                  {f?.avatar ? (
                                    <img src={f.avatar} alt={f.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    f.name.charAt(0).toUpperCase() 
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                                  {f.name}
                                </h3>
                                <p className="text-sm text-slate-400">Friend</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button 
                                onClick={() => handleMessageFriend(f)}
                                disabled={initializingChats.has(f._id)}
                                className={`px-4 py-2 sm:px-6 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 transform ${
                                  initializingChats.has(f._id)
                                    ? 'bg-orange-400 text-white cursor-not-allowed' 
                                    : 'bg-orange-600 text-white hover:from-orange-500 hover:to-orange-400 hover:scale-105 shadow-lg shadow-orange-500/25'
                                }`}
                              >
                                {initializingChats.has(f._id) ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="hidden sm:inline">Opening...</span>
                                  </div>
                                ) : (
                                  'Message'
                                )}
                              </button>
                              <button 
                                onClick={() => removeFriend(f._id)}
                                className="px-4 py-2 sm:px-6 sm:py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                              >
                                Remove
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
                <div className="p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <MdPersonAdd className="w-5 h-5 text-blue-400" />
                      </div>
                      Discover People
                    </h2>
                  </div>
                  
                  {users.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <MdPersonAdd className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                      <p className="text-slate-400">Check back later for more people to connect with!</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4">
                      {users.map(u => {
                        const isLoading = loadingRequests.has(u._id);
                        const requestSent = isRequestSent(u._id);
                        const isFriend = isAlreadyFriend(u._id);
                        const pendingRequest = hasPendingRequest(u._id);
                        
                        // Determine button state
                        let buttonConfig = {};
                        
                        if (isFriend) {
                          buttonConfig = {
                            text: "Friends",
                            disabled: true,
                            className: "px-4 py-2 sm:px-6 sm:py-2 bg-green-600/80 text-white text-sm font-medium rounded-lg cursor-not-allowed opacity-80"
                          };
                        } else if (pendingRequest) {
                          buttonConfig = {
                            text: "Accept",
                            disabled: false,
                            className: "px-4 py-2 sm:px-6 sm:py-2 bg-blue-600  hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25",
                            onClick: () => acceptFriendRequest(u._id, u.name)
                          };
                        } else if (requestSent) {
                          buttonConfig = {
                            text: "Sent",
                            disabled: true,
                            className: "px-4 py-2 sm:px-6 sm:py-2 bg-gray-600/80 text-gray-300 text-sm font-medium rounded-lg cursor-not-allowed opacity-80"
                          };
                        } else {
                          buttonConfig = {
                            text: isLoading ? "" : "Add",
                            disabled: isLoading,
                            className: `px-4 py-2 sm:px-6 sm:py-2 ${isLoading ? 'bg-orange-400' : 'bg-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-500/25 hover:scale-105'} text-white text-sm font-medium rounded-lg transition-all duration-200 transform ${isLoading ? 'cursor-not-allowed' : ''}`,
                            onClick: () => handleSendFriendRequest(u)
                          };
                        }

                        return (
                          <div key={u._id} className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 hover:border-blue-500/30 hover:bg-gray-700/40 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                  u.avatar ? '' : 'bg-blue-600'
                                }`}>
                                  {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    u.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {u.name}
                                  </h3>
                                  <p className="text-sm text-slate-400">
                                    {isFriend ? "Friend" : pendingRequest ? "Wants to be your friend" : "User"}
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
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="hidden sm:inline">Sending...</span>
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
                <div className="p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <FaInbox className="w-5 h-5 text-blue-400" />
                      </div>
                      Friend Requests
                      <span className="text-slate-400 text-lg">({friendRequests.length})</span>
                    </h2>
                  </div>
                  
                  {friendRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <FaInbox className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
                      <p className="text-slate-400">You're all caught up! New friend requests will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4">
                      {friendRequests.map(r => (
                        <div key={r._id} className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 hover:border-green-500/30 hover:bg-gray-700/40 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                r.from.avatar ? '' : 'bg-green-600'
                              }`}>
                                {r.from.avatar ? (
                                  <img src={r.from.avatar} alt={r.from.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  r.from.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                                  {r.from.name}
                                </h3>
                                <p className="text-sm text-slate-400">Wants to be friends</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button 
                                onClick={() => acceptFriendRequest(r.from._id, r.from.name)}
                                className="px-4 py-2 sm:px-6 sm:py-2 bg-green-600 hover:from-green-500 hover:to-green-400 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => rejectFriendRequest(r.from._id, r.from.name)}
                                className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-600/80 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
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
                <div className="p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <FaPaperPlane className="w-5 h-5 text-purple-400" />
                      </div>
                      Sent Requests
                      <span className="text-slate-400 text-lg">({sentRequests.length})</span>
                    </h2>
                  </div>
                  
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-purple-600/20 rounded-full flex items-center justify-center">
                        <FaPaperPlane className="w-12 h-12 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No sent requests</h3>
                      <p className="text-slate-400 mb-4">Start connecting with people by sending friend requests!</p>
                      <button 
                        onClick={() => setActiveTab('add')}
                        className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-200 transform hover:scale-105"
                      >
                        Find People
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4">
                      {sentRequests.map(r => (
                        <div key={r._id} className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 hover:border-purple-500/30 hover:bg-gray-700/40 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                r.to.avatar ? '' : 'bg-purple-600 to-purple-500'
                              }`}>
                                {r.to.avatar ? (
                                  <img src={r.to.avatar} alt={r.to.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  r.to.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                  {r.to.name}
                                </h3>
                                <p className="text-sm text-slate-400">Request pending</p>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => cancelFriendRequest(r.to._id)}
                              className="px-4 py-2 sm:px-6 sm:py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
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

      {/* Mobile Chat Modal */}
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
      />
    </div>
  );
}