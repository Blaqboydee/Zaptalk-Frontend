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

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Friends() {
  const [activeTab, setActiveTab] = useState("friends");
  
  // Modal state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  
  // Loading state for friend requests
  const [loadingRequests, setLoadingRequests] = useState(new Set());

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
  
  console.log("Friend Requests:", friendRequests);
  console.log("Friends:", friends);
  console.log("Sent Requests:", sentRequests);

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

  // Handle opening chat with a friend
  const handleMessageFriend = async (friend) => {
    console.log(friend);
    
    try {
      // Check if chat already exists
      let existingChat = chats.find(chat => 
        chat.users.some(u => u._id === friend._id)
      );

      if (!existingChat) {
        // Create new chat
        const response = await axios.post(`${apiUrl}/chats`, {
          userId: user.id,
          otherUserId: friend._id
        });
        existingChat = response.data;
        addChat(existingChat);
      }

      // Set up modal state
      setSelectedChatId(existingChat._id);
      setOtherUser(friend);
      setIsChatModalOpen(true);
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  // Close modal handler
  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedChatId(null);
    setOtherUser(null);
    setMessages([]);
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

  return (
    <div className="min-h-screen bg-gray-800" style={{ backgroundColor: 'var(--zap-dark-secondary)' }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900 shadow-sm border-b border-gray-700" style={{ backgroundColor: 'var(--zap-dark-primary)', borderColor: 'var(--zap-dark-accent)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center text-white" style={{ color: 'var(--zap-white)' }}>
            Friends
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Sticky Tab Navigation */}
        <div className="sticky top-16 z-10 bg-gray-900 rounded-lg shadow-sm mb-6" style={{ backgroundColor: 'var(--zap-dark-primary)' }}>
    <div className="flex justify-between gap-2">
  {[
    { key: "friends", icon: <FaUserFriends /> },
    { key: "add", icon: <MdPersonAdd /> },
    { key: "requests", icon: <FaInbox /> },
    { key: "sent", icon: <FaPaperPlane /> },
  ].map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`relative flex flex-col items-center justify-center flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
        activeTab === tab.key
          ? "border-orange-600 text-orange-400"
          : "border-transparent text-gray-300 hover:text-white hover:border-gray-600"
      }`}
      style={{
        color: activeTab === tab.key ? "#FB923C" : "var(--zap-gray-light)",
        borderBottomColor: activeTab === tab.key ? "#EA580C" : "transparent",
      }}
    >
      {/* icon */}
      <span className="text-xl">{tab.icon}</span>

      {/* count bubble */}
      {getTabCount(tab.key) > 0 && (
        <span className="absolute top-1 right-5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-600 rounded-full shadow-md">
          {getTabCount(tab.key)}
        </span>
      )}
    </button>
  ))}
</div>

        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--zap-dark-primary)' }}>
          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div className="p-3 lg:p-6">
              <div className="flex items-center justify-between lg:mb-4">
                <h2 className="lg:text-lg font-semibold text-white" style={{ color: 'var(--zap-white)' }}>
                  Your Friends ({friends.length})
                </h2>
              </div>
              {friends?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-400 mb-2">No friends yet</p>
                  <p className="text-sm text-gray-500">Start by adding some friends!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends?.map(f => (
                    <div key={f?._id} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors" style={{ backgroundColor: 'transparent' }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                        f?.avatar ? '' : 'bg-orange-500'
                      }`}>
                        {f?.avatar ? (
                          <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover avatar" />
                        ) : (
                          f.name.charAt(0).toUpperCase() 
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[14px] lg:text-base font-medium text-white" style={{ color: 'var(--zap-white)' }}>{f.name}</h3>
                        <p className="text-[12px] lg:text-sm text-gray-400">Friend</p>
                      </div>
                      <button 
                        onClick={() => handleMessageFriend(f)}
                        className="mr-3 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Message
                      </button>
                      <button 
                        onClick={() => removeFriend(f._id)}
                        className="mr-3 px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Friend Tab */}
          {activeTab === "add" && (
            <div className="p-3 lg:p-6">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <h2 className="lg:text-lg font-semibold text-white" style={{ color: 'var(--zap-white)' }}>
                  Add Friends
                </h2>
              </div>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="lg:space-y-3">
                  {users.map(u => {
                    const isLoading = loadingRequests.has(u._id);
                    const requestSent = isRequestSent(u._id);
                    const isFriend = isAlreadyFriend(u._id);
                    const pendingRequest = hasPendingRequest(u._id);
                    
                    // Determine button state
                    let buttonConfig = {};
                    
                    if (isFriend) {
                      buttonConfig = {
                        text: "Already Friends",
                        disabled: true,
                        className: "px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg cursor-not-allowed opacity-60"
                      };
                    } else if (pendingRequest) {
                      buttonConfig = {
                        text: "Accept Request",
                        disabled: false,
                        className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors",
                        onClick: () => acceptFriendRequest(u._id, u.name)
                      };
                    } else if (requestSent) {
                      buttonConfig = {
                        text: "Request Sent",
                        disabled: true,
                        className: "px-4 py-2 bg-gray-600 text-gray-300 text-sm font-medium rounded-lg cursor-not-allowed opacity-60"
                      };
                    } else {
                      buttonConfig = {
                        text: isLoading ? "" : "Add Friend",
                        disabled: isLoading,
                        className: `px-4 py-2 ${isLoading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-500'} text-white text-sm font-medium rounded-lg transition-colors ${isLoading ? 'cursor-not-allowed' : ''}`,
                        onClick: () => handleSendFriendRequest(u)
                      };
                    }

                    return (
                      <div key={u._id} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                          u.avatar ? '' : 'bg-gray-500'
                        }`}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover avatar" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className=" text-[14px] lg:text-base font-medium text-white" style={{ color: 'var(--zap-white)' }}>{u.name}</h3>
                          <p className="text-[12px] lg:text-sm text-gray-400">
                            {isFriend ? "Friend" : pendingRequest ? "Wants to be your friend" : "User"}
                          </p>
                        </div>
                        <button 
                          onClick={buttonConfig.onClick}
                          disabled={buttonConfig.disabled}
                          className={buttonConfig.className}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Sending...</span>
                            </div>
                          ) : (
                            buttonConfig.text
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === "requests" && (
            <div className="p-3 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="lg:text-lg font-semibold text-white" style={{ color: 'var(--zap-white)' }}>
                  Friend Requests ({friendRequests.length})
                </h2>
              </div>
              {friendRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📥</div>
                  <p className="text-gray-400">No pending requests</p>
                </div>
              ) : (
                <div className="lg:space-y-3">
                  {friendRequests.map(r => (
                    <div key={r._id} className="flex items-center lg:p-3 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                        r.from.avatar ? '' : 'bg-orange-500'
                      }`}>
                        {r.from.avatar ? (
                          <img src={r.from.avatar} alt={r.from.name} className="w-10 h-10 rounded-full object-cover avatar" />
                        ) : (
                          r.from.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[14px] lg:text-base font-medium text-white" style={{ color: 'var(--zap-white)' }}>{r.from.name}</h3>
                        <p className="text-[12px] lg:text-sm text-gray-400">Wants to be friends</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => acceptFriendRequest(r.from._id, r.from.name)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => rejectFriendRequest(r.from._id, r.from.name)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sent Requests Tab */}
          {activeTab === "sent" && (
            <div className="p-3 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="lg:text-lg font-semibold text-white" style={{ color: 'var(--zap-white)' }}>
                  Sent Requests ({sentRequests.length})
                </h2>
              </div>
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📤</div>
                  <p className="text-gray-400">No sent requests</p>
                </div>
              ) : (
                <div className="lg:space-y-3">
                  {sentRequests.map(r => (
                    <div key={r._id} className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                        r.to.avatar ? '' : 'bg-purple-500'
                      }`}>
                        {r.to.avatar ? (
                          <img src={r.to.avatar} alt={r.to.name} className="w-10 h-10 rounded-full object-cover avatar" />
                        ) : (
                          r.to.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[14px] lg:text-base font-medium text-white" style={{ color: 'var(--zap-white)' }}>{r.to.name}</h3>
                        <p className="text-[12px] lg:text-sm text-gray-400">Request pending</p>
                      </div>
                      <button 
                        onClick={() => cancelFriendRequest(r.to._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    // <>
                    // <p>hello</p> <span>{r.to._id}</span>
                    // </>
                    

                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Chat Modal */}
      <MobileChatModal
        isOpen={isChatModalOpen}
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