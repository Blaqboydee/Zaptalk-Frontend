import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageSquare, Users, Search } from 'lucide-react';

const ChatLayout = ({ user }) => {
  const [allMessages, setAllMessages] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/messages/all`);
        setAllMessages(res.data.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [apiUrl]);

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

      {/* Main Header */}
      <header className="sticky top-0   backdrop-blur-md border-b flex justify-end border-gray-700/50">
        <div className="max-w-7xl w-[70%] flex flex-wrap justify-between items-end px-4 sm:px-6 lg:px-8 py-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <MessageSquare size={28} className="text-gray-400" />
            <h1 className="text-2xl font-bold text-white">Chats</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Toggle (Mobile) */}
            <button
              className="sm:hidden p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 transition-all duration-200"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>

            {/* Search Input */}
            <div className={`relative ${isSearchOpen ? 'block' : 'hidden sm:block'} w-full sm:w-auto`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <NavLink
              to="/allchats/directmessages"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'text-white border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-orange-500'
                }`
              }
            >
              <MessageSquare size={18} className="text-gray-400" />
              Direct Messages
            </NavLink>
            <NavLink
              to="/allchats/groups"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'text-white border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-orange-500'
                }`
              }
            >
              <Users size={18} className="text-gray-400" />
              Groups
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <Outlet context={{ user, allMessages }} />
      </div>
    </div>
  );
};

export default ChatLayout;