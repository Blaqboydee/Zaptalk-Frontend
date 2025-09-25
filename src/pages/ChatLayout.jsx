import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink} from 'react-router-dom';
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
    <div className="h-[85vh]">
      {/* Main Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b flex flex-col  border-gray-700/50">
        {/* <div className="max-w-7xl  flex flex-wrap justify-between items-end px-4 sm:px-6 lg:px-8 py-4">
        
          <div className="flex items-center gap-3 text-center w-full justify-center">
            <h1 className="text-lg lg:text-2xl font-bold text-white">Chats</h1>
          </div>
        </div> */}

          {/* Navigation Tabs */}
      <div className=" backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 justify-center">
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
              DMs
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

      </header>


   

    
      {/* Main Content */}

      <div className="">
        <Outlet context={{ user, allMessages }} />
      </div>
    </div>
  );
};

export default ChatLayout;