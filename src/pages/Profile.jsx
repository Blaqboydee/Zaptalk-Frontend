import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function Profile() {
  const {logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data.user);
        
        setProfile(response.data.user);
        setEditForm({
          name: response.data.user.name,
          email: response.data.user.email,
          bioStatus: response.data.user.bioStatus
        });
        setAvatarPreview(response.data.user.avatar);
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/login");
      }
    };
    if (token) fetchProfile();
    else navigate("/login");
  }, [token, navigate]);

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile)
      setEditForm({ name: profile.name, email: profile.email , bioStatus: profile.bioStatus});
  };

  // Save profile changes
  const handleSave = async () => {
    console.log(editForm);
    
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

  // Upload avatar
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
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
    }
  };

  // Logout
  const handleLogout = () => {
   logout()
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="relative">
          <div className="animate-spin w-16 h-16 mb-6 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200/20 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-orange-700 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        <p className="text-gray-300 text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-800/40 backdrop-blur-xl border-b border-gray-700/50 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-2xl w-full text-center font-bold text-white">
            Profile
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="group relative  px-3 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
        >
          <span className="flex items-center space-x-2">
            <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden lg:block">Logout</span>
          </span>
        </button>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          {/* Profile Card */}
          <div className="relative bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl  overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="relative h-20 lg:h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800/20 to-gray-900/60"></div>
            </div>

            {/* Profile Content */}
            <div className="relative p-6 -mt-16">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <label htmlFor="avatarInput" className="cursor-pointer">
                    <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl ring-4 ring-gray-800/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-orange-500/25">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="drop-shadow-lg">
                          {profile.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    {/* Camera Overlay */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
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

                {/* Upload Button */}
                {avatarFile && (
                  <button onClick={handleAvatarUpload} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Avatar</span>
                    </span>
                  </button>
                )}

                {/* Edit / Profile Form */}
                {!isEditing ? (
                  <div className="text-center w-full space-y-3 lg:space-y-6">
                    <div className="space-y-2">
                      <h2 className="lg:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {profile.name}
                      </h2>
                      <p className="text-gray-400 text-sm lg:text-lg break-all">{profile.email}</p>
                      <p className="text-gray-400 mb-2 text-sm sm:text-base break-words italic px-4">
                        "{profile.bioStatus}"
                      </p>
                      <p className={`${profile.status.state == "online" ? 'text-green-300' : 'text-red-600'  } text-sm  lg:text-lg break-all`}>{profile.status.state == 'online' ? 'Online' : 'Offline'}</p>

           
                    </div>

                    <button
                      onClick={handleEditToggle}
                      className="group px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit Profile</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col w-full space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-700/30 backdrop-blur-md text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 placeholder-gray-400"
                        placeholder="Your Name"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="text-base w-full pl-12 pr-4 py-4 rounded-xl bg-gray-700/30 backdrop-blur-md text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 placeholder-gray-400"
                        placeholder="Your Email"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={editForm.bioStatus}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bioStatus: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-700/30 backdrop-blur-md text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 placeholder-gray-400"
                        placeholder="Your status"
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save</span>
                        </span>
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="flex-1 py-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div className="w-full mt-6 pt-6 border-t border-gray-700/50">
                  <div className="grid grid-cols- sm:grid-cols-2 gap-4">
                    <div className="bg-gray-700/20 backdrop-blur-md rounded-2xl p-2 lg:p-4 border border-gray-600/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm font-medium">User ID</p>
                          <p className="text-white font-mono text-sm break-all">{profile._id}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/20 backdrop-blur-md rounded-2xl p-2 lg:p-4 border border-gray-600/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Member Since</p>
                          <p className="text-white text-sm font-semibold">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}