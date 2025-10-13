import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import { FaUser, FaUserFriends, FaComments, FaUserPlus } from "react-icons/fa";

export default function Profile() {
  const navigate = useNavigate();

  const {
    logout,
    setProfile,
    profile,
    editForm,
    setEditForm,
    avatarPreview,
    setAvatarPreview,
    token
  } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile)
      setEditForm({
        name: profile.name,
        email: profile.email,
        bioStatus: profile.bioStatus,
      });
  };

  const handleSave = async () => {
    try {
      const response = await api.put("/users/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const response = await api.post("/users/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(response.data.user);
      setAvatarPreview(response.data.avatarUrl);
      setAvatarFile(null);
    } catch (err) {
      console.error("Error uploading avatar:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      alert("Avatar deletion is currently disabled.");
    } catch (err) {
      console.error("Error deleting avatar:", err);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="relative">
          <div className="animate-spin w-16 h-16 mb-6 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200/20 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-orange-700 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
        <p className="text-gray-300 text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ---------- IMPROVED HEADER ---------- */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-20">
                {/* left: back */}
                {/* <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline text-sm">Back</span>
                </button> */}

                {/* center: title */}
                <div className="flex-1 text-center">
                  <h1 className="text-lg sm:text-2xl font-semibold text-white leading-tight">Profile</h1>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Manage your account settings and preferences</p>
                </div>

                {/* right: small avatar + quick actions */}
                <div className="flex items-center space-x-3">
                  {/* <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-800 bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                      {avatarPreview || profile.avatar ? (
                        <img src={avatarPreview || profile.avatar} alt="You" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profile.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div> */}
                    {/* online dot */}
                    {/* <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-gray-900 ${
                        profile.status?.state === "online" ? "bg-green-400" : "bg-red-400"
                      }`}
                      title={profile.status?.state === "online" ? "Online" : "Offline"}
                    />
                  </div> */}

                  {/* <button
                    onClick={() => {
                      // toggle edit mode quickly from header
                      if (!isEditing) {
                        setIsEditing(true);
                        setEditForm({
                          name: profile.name,
                          email: profile.email,
                          bioStatus: profile.bioStatus,
                        });
                        // scroll to form area on small screens
                        setTimeout(() => window.scrollTo({ top: 180, behavior: "smooth" }), 80);
                      } else {
                        setIsEditing(false);
                      }
                    }}
                    className="hidden sm:inline-flex items-center px-3 py-1.5 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-white hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    {isEditing ? "Editing" : "Edit"}
                  </button> */}

                  <button
                    onClick={() => {
                      logout?.();
                      navigate("/login");
                    }}
                    className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/40 rounded-lg text-sm text-red-300 hidden sm:inline-flex items-center transition-colors"
                    title="Logout"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* thin accent gradient line */}
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          </div>
        </div>
        {/* ---------- END HEADER ---------- */}

        <div className="pt-4 lg:pt-44 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <label htmlFor="avatarInput" className="cursor-pointer block">
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl transition-transform duration-300 group-hover:scale-105">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profile.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-sm">Change Photo</span>
                      </div>
                    </div>
                  </label>
                  <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setAvatarFile(e.target.files[0]);
                      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                    className="hidden"
                  />
                </div>

                {/* Avatar Actions */}
                {avatarFile && (
                  <button
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>
                )}

                {(avatarPreview || profile.avatar) && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">Status</span>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${profile.status.state === "online" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <div className={`w-2 h-2 rounded-full ${profile.status.state === "online" ? "bg-green-500" : "bg-red-500"} ${profile.status.state === "online" ? "animate-pulse" : ""}`}></div>
                  <span className={`text-sm font-medium ${profile.status.state === "online" ? "text-green-400" : "text-red-400"}`}>
                    {profile.status.state === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-gray-300 font-mono text-xs">{profile._id.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Joined</span>
                  <span className="text-gray-300">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                  <p className="text-gray-400 text-sm mt-1">Update your personal details</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {!isEditing ? (
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-white font-medium">{profile.name}</span>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-white break-all">{profile.email}</span>
                      </div>
                    </div>

                    {/* Bio/Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                      <div className="flex items-start space-x-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="text-gray-300 italic break-words">"{profile.bioStatus}"</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-500"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-500"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Bio Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <textarea
                          value={editForm.bioStatus}
                          onChange={(e) => setEditForm({ ...editForm, bioStatus: e.target.value })}
                          rows="3"
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-500 resize-none"
                          placeholder="Write something about yourself..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
