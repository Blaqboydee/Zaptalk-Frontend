import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import { 
  User, 
  Mail, 
  MessageSquare, 
  Camera, 
  Upload, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  LogOut,
  Zap 
} from "lucide-react";

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
      <div 
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: '#0F0F1A' }}
      >
        <div className="relative mb-6">
          <div 
            className="w-16 h-16 rounded-full animate-spin"
            style={{ 
              border: '4px solid #2D2640',
              borderTopColor: '#8B5CF6'
            }}
          />
          <Zap 
            size={24} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ color: '#22D3EE' }}
          />
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#8B5CF6' }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#8B5CF6', animationDelay: '0.2s' }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#8B5CF6', animationDelay: '0.4s' }}
          />
        </div>
        <p className="text-lg" style={{ color: '#A1A1AA' }}>
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-16 pb-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <div 
            className="backdrop-blur-xl shadow-lg"
            style={{ 
              backgroundColor: 'rgba(15, 15, 26, 0.95)',
              borderBottom: '1px solid #2D2640'
            }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-20">
                {/* Center: Title */}
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <User size={20} style={{ color: '#22D3EE' }} />
                    <h1 className="text-lg sm:text-2xl font-semibold text-white">
                      Profile
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: '#A1A1AA' }}>
                    Manage your account settings and preferences
                  </p>
                </div>

                {/* Right: Logout */}
                <button
                  onClick={() => {
                    logout?.();
                    navigate("/login");
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm hidden sm:flex items-center gap-2 transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#EF4444'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Accent line */}
            <div 
              className="h-px"
              style={{ 
                background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)'
              }}
            />
          </div>
        </div>

        <div className="pt-4 lg:pt-32 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column - Avatar & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: '#1A1625',
                border: '1px solid #2D2640'
              }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <label htmlFor="avatarInput" className="cursor-pointer block">
                    <div 
                      className="relative w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center text-4xl font-bold text-white shadow-xl transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: '#8B5CF6' }}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profile.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-white mx-auto mb-1" />
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
                    className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    style={{ backgroundColor: '#8B5CF6' }}
                    onMouseEnter={(e) => !isUploadingAvatar && (e.currentTarget.style.backgroundColor = '#7C3AED')}
                    onMouseLeave={(e) => !isUploadingAvatar && (e.currentTarget.style.backgroundColor = '#8B5CF6')}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <div 
                          className="w-4 h-4 rounded-full animate-spin"
                          style={{ 
                            border: '2px solid #FFFFFF',
                            borderTopColor: 'transparent'
                          }}
                        />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>
                )}

                {(avatarPreview || profile.avatar) && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
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
                    <Trash2 size={16} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: '#1A1625',
                border: '1px solid #2D2640'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
                  Status
                </span>
                <div 
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full"
                  style={{ 
                    backgroundColor: profile.status.state === "online" 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)'
                  }}
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${profile.status.state === "online" ? "animate-pulse" : ""}`}
                    style={{ 
                      backgroundColor: profile.status.state === "online" ? '#10B981' : '#EF4444'
                    }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      color: profile.status.state === "online" ? '#22D3EE' : '#EF4444'
                    }}
                  >
                    {profile.status.state === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#A1A1AA' }}>User ID</span>
                  <span className="font-mono text-xs" style={{ color: '#FFFFFF' }}>
                    {profile._id.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#A1A1AA' }}>Joined</span>
                  <span style={{ color: '#FFFFFF' }}>
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div 
              className="rounded-2xl overflow-hidden"
              style={{ 
                backgroundColor: '#1A1625',
                border: '1px solid #2D2640'
              }}
            >
              {/* Header */}
              <div 
                className="p-6 flex items-center justify-between"
                style={{ borderBottom: '1px solid #2D2640' }}
              >
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Profile Information
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#A1A1AA' }}>
                    Update your personal details
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                    style={{ backgroundColor: '#252032' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
                  >
                    <Edit size={16} />
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
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#A1A1AA' }}
                      >
                        Full Name
                      </label>
                      <div 
                        className="flex items-center space-x-3 p-4 rounded-lg"
                        style={{ 
                          backgroundColor: '#252032',
                          border: '1px solid #2D2640'
                        }}
                      >
                        <User size={20} style={{ color: '#A1A1AA' }} />
                        <span className="text-white font-medium">{profile.name}</span>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#A1A1AA' }}
                      >
                        Email Address
                      </label>
                      <div 
                        className="flex items-center space-x-3 p-4 rounded-lg"
                        style={{ 
                          backgroundColor: '#252032',
                          border: '1px solid #2D2640'
                        }}
                      >
                        <Mail size={20} style={{ color: '#A1A1AA' }} />
                        <span className="text-white break-all">{profile.email}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#A1A1AA' }}
                      >
                        Bio
                      </label>
                      <div 
                        className="flex items-start space-x-3 p-4 rounded-lg"
                        style={{ 
                          backgroundColor: '#252032',
                          border: '1px solid #2D2640'
                        }}
                      >
                        <MessageSquare size={20} className="mt-0.5" style={{ color: '#A1A1AA' }} />
                        <span className="italic break-words" style={{ color: '#FFFFFF' }}>
                          "{profile.bioStatus}"
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Name Input */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#FFFFFF' }}
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <User size={20} style={{ color: '#A1A1AA' }} />
                        </div>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg text-white transition-all duration-200"
                          style={{ 
                            backgroundColor: '#252032',
                            border: '1px solid #2D2640'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#8B5CF6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2D2640';
                            e.target.style.boxShadow = 'none';
                          }}
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#FFFFFF' }}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <Mail size={20} style={{ color: '#A1A1AA' }} />
                        </div>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg text-white transition-all duration-200"
                          style={{ 
                            backgroundColor: '#252032',
                            border: '1px solid #2D2640'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#8B5CF6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2D2640';
                            e.target.style.boxShadow = 'none';
                          }}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Bio Input */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#FFFFFF' }}
                      >
                        Bio
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 pointer-events-none">
                          <MessageSquare size={20} style={{ color: '#A1A1AA' }} />
                        </div>
                        <textarea
                          value={editForm.bioStatus}
                          onChange={(e) => setEditForm({ ...editForm, bioStatus: e.target.value })}
                          rows="3"
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg text-white transition-all duration-200 resize-none"
                          style={{ 
                            backgroundColor: '#252032',
                            border: '1px solid #2D2640'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#8B5CF6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2D2640';
                            e.target.style.boxShadow = 'none';
                          }}
                          placeholder="Write something about yourself..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#8B5CF6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
                      >
                        <Check size={20} />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                        style={{ 
                          backgroundColor: '#252032',
                          border: '1px solid #2D2640'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
                      >
                        <X size={20} />
                        <span>Cancel</span>
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