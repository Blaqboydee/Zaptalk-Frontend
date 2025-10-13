import { useState, useEffect, useContext } from "react";
import { useUsers } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import { useFriends } from "../hooks/useFriends.js";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UsersList() {
  const { users, loading } = useUsers();
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
    error
  } = useFriends();

  const filteredUsers = users.filter(
    (u) =>
      u._id !== user?.id &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFriend = async (targetUser) => {
    setAddingFriendId(targetUser._id);
    try {
      await addFriend(targetUser, user.id);
      await refetchAll();
    } catch (error) {
      console.error("Failed to add friend:", error);
    } finally {
      setAddingFriendId(null);
    }
  };

  const handleCancelRequest = async (friendId) => {
    setCancelingFriendId(friendId);
    try {
      await cancelFriendRequest(friendId);
      await refetchAll();
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
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
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      {/* Fixed Header with Search */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header Info */}
          <div className="mb-4">
            <h1 className="text-xl lg:text-3xl font-bold text-white text-center">Discover People</h1>
            <p className="text-gray-400 text-sm lg:text-base mt-1 text-center">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} available
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors"
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
              className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-40 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
              <p className="text-gray-400">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              {/* MOBILE:  horizontal swipe list */}
              <div className="md:hidden">
                <div
                  className="flex flex-col gap-3 pb-4 px-1 snap-x snap-mandatory -ml-1"
                  role="list"
                  aria-label="Suggested people"
                >
                  {filteredUsers.map((u) => {
                    const isFriend = friends?.some((f) => f._id === u._id);
                    const hasSentRequest = sentRequests?.some((r) => r.to._id === u._id);
                    const isAdding = addingFriendId === u._id;
                    const isCanceling = cancelingFriendId === u._id;

                    return (
                      <div
                        key={u._id}
                        className="snap-start flex-shrink-0 w-full p-3"
                        role="listitem"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden ring-4 ring-gray-800">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{u.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            {(isFriend || hasSentRequest) && (
                              <div
                                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                                  isFriend ? "bg-green-500" : "bg-yellow-500"
                                }`}
                              >
                                {isFriend ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm lg:text-base text-white font-semibold truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 lg:text-sm truncate">{u.email}</p>
                          </div>

                          <div className="flex-shrink-0">
                            {isFriend ? (
                              <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm font-medium">
                                Friends
                              </div>
                            ) : hasSentRequest ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelRequest(u._id);
                                }}
                                disabled={isCanceling}
                                className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 text-sm font-medium disabled:opacity-50"
                              >
                                {isCanceling ? "Canceling..." : "Cancel"}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddFriend(u);
                                }}
                                disabled={isAdding}
                                className="px-3 py-1 rounded-lg bg-orange-500 text-white text-sm font-medium disabled:opacity-50"
                              >
                                {isAdding ? "Adding..." : "Add"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DESKTOP/TABLET: original grid */}
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUsers.map((u) => {
                  const isFriend = friends?.some((f) => f._id === u._id);
                  const hasSentRequest = sentRequests?.some((r) => r.to._id === u._id);
                  const isAdding = addingFriendId === u._id;
                  const isCanceling = cancelingFriendId === u._id;

                  return (
                    <div
                      key={u._id}
                      className="group bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative bg-gray-900/50 p-6 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-gray-800">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{u.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>

                          {(isFriend || hasSentRequest) && (
                            <div
                              className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white ${
                                isFriend ? "bg-green-500" : "bg-yellow-500"
                              }`}
                            >
                              {isFriend ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-1 truncate">{u.name}</h3>
                        <p className="text-gray-400 text-sm truncate mb-4">{u.email}</p>

                        {isFriend ? (
                          <div className="flex items-center justify-center space-x-2 py-2.5 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 font-medium text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Friends</span>
                          </div>
                        ) : hasSentRequest ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRequest(u._id);
                            }}
                            disabled={isCanceling}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 hover:border-yellow-500 rounded-lg text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCanceling ? (
                              <>
                                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Canceling...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Cancel Request</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddFriend(u);
                            }}
                            disabled={isAdding}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAdding ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                <span>Add Friend</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Scrollbar & snap styles */}
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

        /* Make horizontal scroller smoother on iOS/Android */
        .snap-x {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}
