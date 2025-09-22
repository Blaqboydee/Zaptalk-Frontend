import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import { useFriends } from "../hooks/useFriends.js";
// import { MdGroup, FaUserPlus } from "react-icons/md";
import { FaUser, FaUserFriends, FaComments, FaUserPlus } from "react-icons/fa";

import { useToast } from "../context/ToastContainer.jsx";


const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UsersList() {
 
  const { users, loading } = useUsers();
  const {toast} = useToast();
  const { user } = useContext(AuthContext);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addingFriendId, setAddingFriendId] = useState(null);
  const [cancelingFriendId, setCancelingFriendId] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
   const { 
  friends, 
  requests, 
  sentRequests, 
  addFriend,
  acceptFriendRequest, 
  rejectFriendRequest, 
  cancelFriendRequest,
  refetchAll,
  // loading, 
  error 
} = useFriends();

  // Filter users based on search term and exclude current user
  const filteredUsers = users.filter(
    (u) =>
      u._id !== user?.id &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle adding friend
  const handleAddFriend = async (targetUser) => {
    console.log(targetUser._id);
    console.log(user);
    
    
    setAddingFriendId(targetUser._id);
    try {
      await addFriend(targetUser, user.id);
      await refetchAll();
    } catch (error) {
      console.error('Failed to add friend:', error);
    } finally {
      setAddingFriendId(null);
    }
  };

  // Handle canceling friend request
  const handleCancelRequest = async (friendId) => {
    setCancelingFriendId(friendId);
    try {
      await cancelFriendRequest(friendId);
      // Instant UI update - refetch to get latest data
      await refetchAll();
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
    } finally {
      setCancelingFriendId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg animate-pulse">Loading users...</p>
          <p className="text-gray-400 text-sm mt-2">Discovering amazing people</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated background elements */}

      {/* Header */}
      <header className="sticky top-0 bg-gradient-to-r from-gray-800/90 via-gray-700/80 to-gray-800/90 backdrop-blur-xl border-b border-gray-600/50 shadow-2xl">
        <div className="max-w-7xl mx-auto py-3 lg:px-4 lg:py-6">
          <div className="text-center">
            <div className="flex w-full justify-center gap-3">
               <span><FaUserPlus size={28}/></span> 
                 <h2 className="text-md lg:text-lg font-bold mb-2">
              Discover People
            </h2>
            </div>
          
            <p className="text-gray-300 text-sm lg:text-lg mt-2">Connect with amazing people around the world</p>
    
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg
                className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-2 lg:py-4 rounded-lg border border-gray-600/50 bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 shadow-lg focus:shadow-orange-500/20 text-base lg:text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Search glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="px-6 pb-12 h-[70vh] overflow-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg--gray-700 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl text-gray-300 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
              {filteredUsers.map((u, index) => {
                const isFriend = friends?.some((f) => f._id === u._id);
                const hasSentRequest = sentRequests?.some((r) => r.to._id === u._id);
                const isAdding = addingFriendId === u._id;
                const isCanceling = cancelingFriendId === u._id;
                const wasRecentlyAdded = recentlyAdded.has(u._id);
                
                return (
                  <div
                    key={u._id}
                    className="group relative rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl bg-gray-700/80 to-gray-800/90 border border-gray-600/30 hover:border-orange-500/50 backdrop-blur-sm overflow-hidden"
                    style={{
                      animation: `slideUp 0.4s ease-out ${index * 0.05}s both`
                    }}
                  >
            

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasSentRequest && !isCanceling) {
                          handleCancelRequest(u._id);
                        } else if (!isFriend && !isAdding && !hasSentRequest) {
                          handleAddFriend(u);
                        }
                      }}
                      disabled={isFriend || isAdding || isCanceling}
                      className={`absolute top-1 right-1 w-8 h-8 rounded-full flex justify-center items-center z-50 shadow-lg transition-all duration-500 transform border-2 border-gray-800 ${
                        isFriend || wasRecentlyAdded
                          ? "bg-gradient-to-r from-green-500 to-green-600 cursor-not-allowed scale-100"
                          : hasSentRequest
                          ? isCanceling 
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse cursor-not-allowed scale-110"
                            : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:scale-110 cursor-pointer"
                          : isAdding
                          ? "bg-gradient-to-r from-orange-400 to-orange-500 animate-pulse cursor-not-allowed scale-110"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-110 cursor-pointer"
                      }`}
                    >
                      {isFriend || wasRecentlyAdded ? (
                        <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : hasSentRequest ? (
                        isCanceling ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            className="w-4 h-4 text-white font-bold transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                          </svg>
                        )
                      ) : isAdding ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-4 h-4 text-white font-bold group-hover:rotate-90 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col items-center justify-center h-full">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden shadow-lg ring-2 ring-orange-500/20 group-hover:ring-orange-400/40 transition-all duration-300">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Avatar glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-bold text-sm sm:text-base text-white mb-1 group-hover:text-orange-300 transition-colors duration-300 truncate max-w-[120px]">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[120px]">
                          {u.email}
                        </p>
                      </div>
                    </div>

          

                    {/* Friend added overlay */}
                    {(isFriend || wasRecentlyAdded) && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-green-500/90 via-green-600/90 to-green-700/90 rounded-2xl">
                        <div className="text-white text-center">
                          <div className="text-3xl mb-2">✓</div>
                          <p className="font-semibold text-sm">Friends</p>
                        </div>
                      </div>
                    )}

                    {/* Sent request overlay */}
                    {hasSentRequest && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-yellow-500/90 via-yellow-600/90 to-yellow-700/90 rounded-2xl">
                        <div className="text-white text-center">
                          <div className="text-3xl mb-2">⏳</div>
                          <p className="font-semibold text-sm">Request Sent</p>
                          <p className="text-xs opacity-80">Click to cancel</p>
                        </div>
                      </div>
                    )}

                    {/* Accent Border */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 transform transition-all duration-500 ${
                      isFriend || wasRecentlyAdded 
                        ? 'scale-x-100 bg-green-500' 
                        : hasSentRequest
                        ? 'scale-x-100 bg-yellow-500'
                        : 'scale-x-0 group-hover:scale-x-100 bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}></div>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}