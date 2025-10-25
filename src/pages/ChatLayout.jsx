import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageSquare, Users, Zap } from 'lucide-react';

const ChatLayout = ({ user }) => {
  const [allMessages, setAllMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/messages/all`);
        setAllMessages(res.data.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [apiUrl]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F0F1A' }}>
      {/* Fixed Header with Glass Effect */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
        style={{ 
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          borderBottom: '1px solid #2D2640'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section with Logo */}
          <div 
            className="py-6 text-center animate-fade-in"
            style={{ borderBottom: '1px solid #2D2640' }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                <Zap size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-white">
                Zap<span style={{ color: '#22D3EE' }}>Talk</span>
              </h1>
            </div>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Stay connected with your conversations
            </p>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center justify-center gap-2">
            <NavLink
              to="/allchats/directmessages"
              className={({ isActive }) =>
                `group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                borderBottomColor: isActive ? '#8B5CF6' : 'transparent'
              })}
            >
              {({ isActive }) => (
                <>
                  <MessageSquare 
                    size={18} 
                    className="transition-transform group-hover:scale-110"
                    style={{ color: isActive ? '#8B5CF6' : 'inherit' }}
                  />
                  <span>Direct Messages</span>
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#22D3EE' }}
                    />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/allchats/groups"
              className={({ isActive }) =>
                `group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                borderBottomColor: isActive ? '#8B5CF6' : 'transparent'
              })}
            >
              {({ isActive }) => (
                <>
                  <Users 
                    size={18} 
                    className="transition-transform group-hover:scale-110"
                    style={{ color: isActive ? '#8B5CF6' : 'inherit' }}
                  />
                  <span>Groups</span>
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#22D3EE' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content with smooth entrance */}
      <div className="pt-40 animate-fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-full animate-spin"
                  style={{ 
                    border: '3px solid #2D2640',
                    borderTopColor: '#8B5CF6'
                  }}
                />
                <Zap 
                  size={20} 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ color: '#22D3EE' }}
                />
              </div>
              <p className="text-sm" style={{ color: '#71717A' }}>
                Loading your conversations...
              </p>
            </div>
          </div>
        ) : (
          <Outlet context={{ user, allMessages }} />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;