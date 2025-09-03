import { useNavigate } from "react-router-dom";
import { useUsers } from "../context/UsersContext";

export default function UsersList({ user }) {
  const navigate = useNavigate();
  const { users, loading } = useUsers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-spin bg-gradient-to-r from-orange-500 to-orange-600">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full animate-pulse bg-orange-500"></div>
            <div className="w-3 h-3 rounded-full animate-pulse bg-orange-600" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3 h-3 rounded-full animate-pulse bg-orange-700" style={{ animationDelay: '400ms' }}></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium text-lg">Loading Users...</p>
        </div>
      </div>
    );
  }

  const startChat = (otherUser) => {
    navigate("/chat", {
      state: { otherUserId: otherUser._id, otherUserName: otherUser.name },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-pulse"
             style={{ background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse"
             style={{ background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent)', animationDelay: '0.5s' }}></div>
        <div className="absolute top-20 left-20 w-48 h-48 rounded-full opacity-10 animate-pulse"
             style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)', animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 p-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white">💬 ZapTalk Users</h2>
          <p className="text-sm text-gray-400 mt-1">Connect with others</p>
        </div>
      </header>

      {/* Users Grid */}
      <div className="p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => startChat(u)}
                className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gray-800/80 border border-gray-700/50"
              >
                {/* Card Content */}
                <div className="p-5">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 mx-auto bg-gradient-to-r from-orange-500 to-orange-600">
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <p className="font-bold text-lg text-white mb-1">{u.name}</p>
                    <p className="text-sm text-gray-400 mb-2">{u.email}</p>
                    <p className="text-xs font-mono px-2 py-1 rounded bg-gray-700/50 text-orange-500">
                      {u._id}
                    </p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-orange-500/90">
                  <div className="text-white text-center">
                    <div className="text-2xl mb-2">💬</div>
                    <p className="font-semibold">Start Chat</p>
                  </div>
                </div>

                {/* Accent Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-orange-600"></div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-700/50">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xl font-medium text-white mb-2">No users found</p>
              <p className="text-gray-400">Check back later for available users to chat with</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}