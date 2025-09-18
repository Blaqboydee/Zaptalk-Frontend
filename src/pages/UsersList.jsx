import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../context/UsersContext";

export default function UsersList() {
  const navigate = useNavigate();
  const { users, loading } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-spin bg-gradient-to-r from-orange-500 to-orange-600">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full animate-pulse bg-orange-500"></div>
            <div
              className="w-3 h-3 rounded-full animate-pulse bg-orange-600"
              style={{ animationDelay: "200ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full animate-pulse bg-orange-700"
              style={{ animationDelay: "400ms" }}
            ></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium text-lg">
            Loading Users...
          </p>
        </div>
      </div>
    );
  }

  const Add = (otherUser) => {
    navigate("/allchats", {
      state: {
        otherUserId: otherUser._id,
        otherUserName: otherUser.name,
        otherUserAvatar: otherUser.avatar,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="relative bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 p-2">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="lg:text-2xl font-bold text-white">👥 ZapTalk Users</h2>
          <p className="text-sm text-gray-400 mt-1">Connect with others</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-6 pb-2 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
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
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-gray-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-4 text-center">
              <p className="text-gray-400 text-sm">
                {filteredUsers.length > 0
                  ? `Found ${filteredUsers.length} user${
                      filteredUsers.length === 1 ? "" : "s"
                    } matching "${searchTerm}"`
                  : `No users found matching "${searchTerm}"`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="px-6 pb-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 relative">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
               
                className="group relative rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gray-800/80 border border-gray-700/50"
              >
                <button 
                 onClick={() => Add(u)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full h-6 w-6 flex justify-center items-center absolute -bottom-2 -right-2 z-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-gray-900 group">
                  <svg
                    className="w-3 h-3 text-white font-bold group-hover:rotate-90 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                {/* Card Content */}
                <div className="p-3 sm:p-5 flex flex-col items-center justify-center">
                  {/* User Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg mb-2 sm:mb-3 mx-auto bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden relative">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <p className="font-bold text-[10px] sm:text-lg text-white">
                      {u.name}
                    </p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-orange-500/90">
                  <div className="text-white text-center">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">+</div>
                    <p className="font-semibold text-sm sm:text-base">Add</p>
                  </div>
                </div>

                {/* Accent Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-orange-600"></div>
              </div>
            ))}
          </div>

          {/* Empty State for Search Results */}
          {searchTerm && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-700/50">
                <svg
                  className="w-10 h-10 text-gray-400"
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
              <p className="text-xl font-medium text-white mb-2">
                No users found
              </p>
              <p className="text-gray-400 mb-4">
                Try adjusting your search terms
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Empty State for No Users */}
          {!searchTerm && users.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-700/50">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-xl font-medium text-white mb-2">
                No users found
              </p>
              <p className="text-gray-400">
                Check back later for available users to chat with
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
