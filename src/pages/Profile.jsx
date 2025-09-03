import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data.user);
        setEditForm({
          name: response.data.user.name,
          email: response.data.user.email,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/login");
      }
    };

    if (token) {
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put("/users/profile", editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-700/50 text-white transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-sm text-gray-400">Manage your account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          {profile ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-3xl shadow-lg p-8 backdrop-blur-md bg-gray-800/80 border border-gray-700/50">
                {/* Profile Header */}
                <div className="text-center relative">
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={handleEditToggle}
                      className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 transition-all duration-200"
                    >
                      {isEditing ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Avatar */}
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl mx-auto bg-gradient-to-r from-orange-500 to-orange-600">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 border-4 border-gray-800 rounded-full"></div>
                  </div>

                  {/* Name and Email */}
                  {!isEditing ? (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
                      <p className="text-gray-400 mb-4">{profile.email}</p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-orange-500">
                        <div className="w-2 h-2 rounded-full mr-2 bg-green-400"></div>
                        Active
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
                          placeholder="Your email"
                        />
                      </div>
                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={handleSave}
                          className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="flex-1 py-3 rounded-lg font-semibold border border-gray-600 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                {!isEditing && (
                  <div className="px-8 pb-8 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-lg bg-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Username</p>
                            <p className="font-semibold text-white">{profile.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Email</p>
                            <p className="font-semibold text-white">{profile.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">User ID</p>
                            <p className="font-mono text-sm text-white">{profile._id}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Member Since</p>
                            <p className="font-semibold text-white">
                              {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate("/allchats")}
                    className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gray-800/80 border border-gray-600 hover:bg-gray-700/80 hover:border-orange-500 text-white transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">My Chats</p>
                      <p className="text-sm text-gray-400">View conversations</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/users")}
                    className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gray-800/80 border border-gray-600 hover:bg-gray-700/80 hover:border-orange-500 text-white transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Find Users</p>
                      <p className="text-sm text-gray-400">Discover people</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-spin bg-gradient-to-r from-orange-500 to-orange-600">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse bg-orange-500"></div>
                <div className="w-3 h-3 rounded-full animate-pulse bg-orange-600" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 rounded-full animate-pulse bg-orange-700" style={{ animationDelay: '400ms' }}></div>
              </div>
              <p className="mt-4 text-gray-400">Loading your profile...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}