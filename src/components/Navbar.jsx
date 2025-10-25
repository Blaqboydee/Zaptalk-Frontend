import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/zaptalklogo.png";
import { useNavigate } from "react-router-dom";
import { useGlobalSocket } from "../context/SocketContext";
import { 
  MessageCircle, 
  Users, 
  UserPlus, 
  User as UserIcon,
  LogOut, 
  X,
  Zap
} from "lucide-react";

export default function Navbar() {
  const { user, logout, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { socket } = useGlobalSocket();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return (
    <>
      {/* Fixed Toggle Button - Always visible */}
      <div className={`z-50 ${isMobile ? 'fixed top-3 left-4' : 'fixed top-6 left-6'}`}>
        <button
          onClick={toggleSidebar}
          className="transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Toggle navigation menu"
        >
          {profile ? (
            <div 
              className={`${isMobile ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl flex items-center justify-center text-white font-semibold shadow-lg transition-all duration-200`}
              style={{ 
                backgroundColor: profile.avatar ? 'transparent' : '#8B5CF6',
                border: '2px solid #8B5CF6'
              }}
              onMouseEnter={(e) => {
                if (!profile.avatar) {
                  e.currentTarget.style.backgroundColor = '#7C3AED';
                  e.currentTarget.style.borderColor = '#7C3AED';
                }
              }}
              onMouseLeave={(e) => {
                if (!profile.avatar) {
                  e.currentTarget.style.backgroundColor = '#8B5CF6';
                  e.currentTarget.style.borderColor = '#8B5CF6';
                }
              }}
            >
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={user.name} 
                  className={`${isMobile ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl object-cover`} 
                />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
          ) : (
            <div 
              className="p-2 rounded-xl shadow-lg transition-all duration-200"
              style={{ backgroundColor: '#8B5CF6' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 transition-all duration-300 animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={closeSidebar}
        />
      )}

      {/* Off-Canvas Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 z-50 transform transition-all duration-500 ease-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: '#1A1625' }}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close Button */}
          <div 
            className="flex-shrink-0 p-8"
            style={{ 
              borderBottom: '1px solid #2D2640',
              backgroundColor: '#252032'
            }}
          >
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
                onClick={closeSidebar}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <Zap size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold text-white tracking-wide">
                  Zap<span style={{ color: '#22D3EE' }}>Talk</span>
                </span>
              </Link>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: '#1A1625' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1A1625'}
                aria-label="Close menu"
              >
                <X size={20} style={{ color: '#A1A1AA' }} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col p-6 space-y-3 overflow-y-auto">
            {!user && (
              <>
                <div className="mb-4">
                  <p 
                    className="text-sm font-medium uppercase tracking-wider mb-4"
                    style={{ color: '#71717A' }}
                  >
                    Get Started
                  </p>
                  <div className="space-y-2">
                    <Link
                      to="/signup"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252032'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={closeSidebar}
                    >
                      <UserPlus size={20} className="group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Sign Up</span>
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl group hover:scale-105"
                      style={{ backgroundColor: '#8B5CF6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
                      onClick={closeSidebar}
                    >
                      <Zap size={20} className="group-hover:rotate-12 transition-transform duration-200" />
                      <span className="font-medium">Login</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            {user && (
              <>
                {/* User Welcome Section */}
                <div 
                  className="mb-6 p-4 rounded-xl"
                  style={{ 
                    backgroundColor: '#252032',
                    border: '1px solid #2D2640'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: profile?.avatar ? 'transparent' : '#8B5CF6' }}
                    >
                      {profile?.avatar ? (
                        <img 
                          src={profile?.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">Welcome back!</p>
                      <p className="text-sm" style={{ color: '#A1A1AA' }}>
                        {user.name || "User"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="mb-4">
                  <p 
                    className="text-sm font-medium uppercase tracking-wider mb-4"
                    style={{ color: '#71717A' }}
                  >
                    Navigation
                  </p>
                  <div className="space-y-2">
                    <Link
                      to="/allchats"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#252032';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      onClick={closeSidebar}
                    >
                      <MessageCircle 
                        size={20} 
                        className="group-hover:scale-110 transition-transform duration-200"
                        style={{ color: '#8B5CF6' }}
                      />
                      <span className="font-medium">My Chats</span>
                    </Link>
                    <Link
                      to="/friends"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#252032';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      onClick={closeSidebar}
                    >
                      <Users 
                        size={20} 
                        className="group-hover:scale-110 transition-transform duration-200"
                        style={{ color: '#8B5CF6' }}
                      />
                      <span className="font-medium">Friends</span>
                    </Link>
                    <Link
                      to="/users"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#252032';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      onClick={closeSidebar}
                    >
                      <UserPlus 
                        size={20} 
                        className="group-hover:scale-110 transition-transform duration-200"
                        style={{ color: '#8B5CF6' }}
                      />
                      <span className="font-medium">Find Users</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#252032';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      onClick={closeSidebar}
                    >
                      <UserIcon 
                        size={20} 
                        className="group-hover:scale-110 transition-transform duration-200"
                        style={{ color: '#8B5CF6' }}
                      />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </div>
                </div>

                {/* Logout Section */}
                <div 
                  className="mt-auto pt-4"
                  style={{ borderTop: '1px solid #2D2640' }}
                >
                  <button
                    onClick={() => {
                      socket?.emit("user-offline", profile._id);
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl group hover:scale-105"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.5)'
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
                    <LogOut 
                      size={20} 
                      className="group-hover:scale-110 transition-transform duration-200"
                      style={{ color: '#EF4444' }}
                    />
                    <span className="font-medium" style={{ color: '#EF4444' }}>
                      Logout
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}