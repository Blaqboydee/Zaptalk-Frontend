import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/zaptalklogo.png"

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
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
      <div className={`z-50 ${
        isMobile 
          ? 'fixed bottom-6 left-6'
          : 'fixed top-6 left-6'    
      }`}>
        <button
          onClick={toggleSidebar}
          className={`bg-slate-800 hover:bg-slate-700 text-white ${
            isMobile ? "p-4" : "p-3"
          } rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-slate-600/50`}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Off-Canvas Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 z-50 transform transition-all duration-500 ease-out ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close Button */}
          <div className="flex-shrink-0 p-8 border-b border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
                onClick={closeSidebar}
              >
                <img className="w-10 h-10 rounded-lg" src={logo} alt="ZapTalk Logo" />
                <span className="text-xl font-bold text-white tracking-wide">ZapTalk</span>
              </Link>
              <button
                onClick={closeSidebar}
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-xl transition-all duration-200"
                aria-label="Close menu"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col p-6 space-y-3 overflow-y-auto">
            {!user && (
              <>
                <div className="mb-4">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
                    Get Started
                  </p>
                  <div className="space-y-2">
                    <Link
                      to="/signup"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-slate-800 transition-all duration-200 group"
                      onClick={closeSidebar}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📝</span>
                      <span className="font-medium">Sign Up</span>
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-all duration-200 shadow-lg hover:shadow-xl group"
                      onClick={closeSidebar}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">🔑</span>
                      <span className="font-medium">Login</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            {user && (
              <>
                {/* User Welcome Section */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-white font-medium">Welcome back!</p>
                      <p className="text-slate-400 text-sm">{user.name || "User"}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="mb-4">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
                    Navigation
                  </p>
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-slate-800 transition-all duration-200 group"
                      onClick={closeSidebar}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">👤</span>
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link
                      to="/allchats"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-slate-800 transition-all duration-200 group"
                      onClick={closeSidebar}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">💬</span>
                      <span className="font-medium">My Chats</span>
                    </Link>
                    <Link
                      to="/users"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-slate-800 transition-all duration-200 group"
                      onClick={closeSidebar}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">👥</span>
                      <span className="font-medium">Find Friends</span>
                    </Link>
                  </div>
                </div>

                {/* Logout Section */}
                <div className="mt-auto pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => {
                      logout();
                      closeSidebar();
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all duration-200 shadow-lg hover:shadow-xl group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">🚪</span>
                    <span className="font-medium">Logout</span>
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