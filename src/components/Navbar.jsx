import { Link } from "react-router-dom";
import { useContext, useState } from "react";
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


  const useIsMobile = () => {

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

  return isMobile;
};

  return (
    <>
      {/* Fixed Toggle Button - Always visible */}
        <div className={`z-50 ${
      isMobile 
        ? 'fixed bottom-3 left-4'
        : 'fixed top-2 left-2'    
    }`}>
        <button
          onClick={toggleSidebar}
          className={`bg-gray-800 text-white  ${isMobile? "p-3" : "p-1"} rounded-full shadow-lg hover:bg-gray-900 focus:outline-none transition-all duration-200`}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Off-Canvas Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close Button */}
          <div className="flex-shrink-0 p-6 border-b border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-2xl font-bold text-white hover:text-orange-100 transition-colors duration-200"
                onClick={closeSidebar}
              >
                <img className="w-12" src={logo} alt="ZapTalk Logo" />
              </Link>
              <button
                onClick={closeSidebar}
                className="text-white hover:text-gray-300 focus:outline-none ml-4"
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
          <div className="flex-1 flex flex-col px-4 py-6 space-y-2">
            {!user && (
              <>
                <Link
                  to="/signup"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  📝 Sign Up
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg text-base font-medium bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-30"
                  onClick={closeSidebar}
                >
                  🔑 Login
                </Link>
              </>
            )}
            {user && (
              <>
                <div className="px-4 py-2 text-sm text-white opacity-70 border-b border-white border-opacity-20 mb-4">
                  Welcome, <span className="font-semibold">{user.name || "User"}</span>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  👤 Profile
                </Link>
                <Link
                  to="/allchats"
                  className="block px-4 py-3 rounded-lg text-base font-medium bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-30"
                  onClick={closeSidebar}
                >
                  💬 My Chats
                </Link>
                <Link
                  to="/users"
                  className="block px-4 py-3 rounded-lg text-base font-medium bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-30"
                  onClick={closeSidebar}
                >
                  👥 Find Friends
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium bg-red-700 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg mt-4"
                >
                  🚪 Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}