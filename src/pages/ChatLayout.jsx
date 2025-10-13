import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';

const ChatLayout = ({ user }) => {
  const [allMessages, setAllMessages] = useState([]);
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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="py-4 border-b border-gray-800 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Chats</h1>
            <p className="text-gray-400 text-sm mt-1">Stay connected with your conversations</p>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex -mb-px  lg:items-center lg:justify-center">
            <NavLink
              to="/allchats/directmessages"
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'text-white border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }`
              }
            >
              <MessageSquare size={18} />
              <span>Direct Messages</span>
            </NavLink>
            <NavLink
              to="/allchats/groups"
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'text-white border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }`
              }
            >
              <Users size={18} />
              <span>Groups</span>
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content with top padding */}
      <div className="pt-36">
        <Outlet context={{ user, allMessages }} />
      </div>
    </div>
  );
};

export default ChatLayout;