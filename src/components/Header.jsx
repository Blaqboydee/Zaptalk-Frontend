import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    
    if (path.includes('/allchats') || path === '/') {
      return 'Chats';
    } else if (path.includes('/profile')) {
      return 'Profile';
    } else if (path.includes('/users') || path.includes('/find')) {
      return 'Find Users';
    } else if (path.includes('/friends')) {
      return 'Friends';
    } else {
      return 'App'; // Default fallback
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-gray-700/50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - could add back button or menu */}
          <div className="flex items-center space-x-4">
            {/* Optional: Add a logo or back button here */}
            {/* <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div> */}
          </div>

          {/* Center - Page Title */}
          <div className="flex-1 text-center">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side - could add notifications or settings */}
          {/* <div className="flex items-center space-x-3">
  
            <button className="p-2 rounded-xl bg-gray-700/30 hover:bg-gray-600/40 transition-all duration-200 group">
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5-5-5h5v-12h5v12z"
                />
              </svg>
            </button>
          </div> */}
        </div>

        {/* Optional: Add a subtle progress bar or breadcrumb here */}
        {/* <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent rounded-full"></div> */}
      </div>
    </header>
  );
};

export default Header;