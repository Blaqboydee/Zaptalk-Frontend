import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, MessageCircle, UserMinus, Send, X, Check } from 'lucide-react';
import { useUsers } from "../context/UsersContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import { io } from "socket.io-client";
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(apiUrl);


const GroupChats = () => {
  const { user, allMessages } = useOutletContext();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const { users, loading } = useUsers();
  const [messages, setMessages] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch group chats
  const fetchGroupChats = async () => {
    try {
      const response = await fetch(`${apiUrl}/chats/group?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch group chats");
      }
      const data = await response.json();
      setGroupChats(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching group chats:", error);
      setError("Failed to load groups. Please try again.");
    }
  };

  useEffect(() => {
    fetchGroupChats();
  }, [user.id]);

  // Socket setup for real-time updates
  useEffect(() => {
    if (!selectedGroup) return;

    console.log("Joining group chat:", selectedGroup._id);
    socket.emit("join_chat", selectedGroup._id);

    // Fetch messages when group is selected
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`${apiUrl}/messages?chatId=${selectedGroup._id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
          setError(null);
        } else {
          throw new Error("Failed to fetch messages");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      console.log("Leaving group chat:", selectedGroup._id);
      socket.emit("leave_chat", selectedGroup._id);
    };
  }, [selectedGroup]);

  // Socket message handling - separate effect to avoid conflicts
  useEffect(() => {
    const handleMessage = (message) => {
      console.log("Received message via socket:", message);
      
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        if (prev.some((m) => m._id === message._id)) {
          console.log("Message already exists, skipping");
          return prev;
        }
        
        // Remove any pending optimistic messages from the same sender with similar content and timestamp
        const filteredMessages = prev.filter((m) => {
          if (!m.pending) return true;
          
          // Remove optimistic message if it matches content and sender and was sent recently
          const isSameSender = (m.senderId?._id || m.senderId) === message.senderId?._id;
          const isSameContent = m.content.trim() === message.content.trim();
          const isRecent = new Date(message.createdAt) - new Date(m.createdAt) < 5000; // Within 5 seconds
          
          if (isSameSender && isSameContent && isRecent) {
            console.log("Removing optimistic message:", m._id);
            return false;
          }
          return true;
        });
        
        console.log("Adding new message to UI");
        return [...filteredMessages, message];
      });

      // Update group chats list with latest message
      setGroupChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              updatedAt: message.createdAt
            };
          }
          return chat;
        });
      });
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);

  // Handle resize for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Only open offcanvas on mobile if a group is selected
      if (mobile && selectedGroup) {
        setIsOffcanvasOpen(true);
      } else {
        setIsOffcanvasOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      try {
        const payload = {
          name: groupName.trim(),
          userIds: [user.id, ...selectedUsers.map(u => u._id)],
          isDirect: false
        };

        const groupRes = await fetch(`${apiUrl}/chats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!groupRes.ok) {
          throw new Error("Failed to create group");
        }

        const groupData = await groupRes.json();
        setShowCreateModal(false);
        setGroupName('');
        setSelectedUsers([]);
        setError(null);
        await fetchGroupChats();
        setSelectedGroup(groupData);
      } catch (err) {
        console.error("Error creating group:", err);
        setError("Failed to create group. Please try again.");
      }
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Send to server via socket
      socket.emit("send_message", {
        content: messageContent,
        senderId: user.id,
        chatId: selectedGroup._id,
      });
      
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      // Restore the message input on error
      setNewMessage(messageContent);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    if (isMobile) {
      setIsOffcanvasOpen(true);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;

    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        const response = await fetch(`${apiUrl}/chats/${selectedGroup._id}/leave`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id })
        });

        if (!response.ok) {
          throw new Error("Failed to leave group");
        }

        await fetchGroupChats();
        setSelectedGroup(null);
        setIsOffcanvasOpen(false);
        setMessages([]);
        setError(null);
      } catch (err) {
        console.error("Error leaving group:", err);
        setError("Failed to leave group. Please try again.");
      }
    }
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
    if (isMobile) {
      setSelectedGroup(null);
      setMessages([]);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    return diffInHours < 24
      ? messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : messageDate.toLocaleDateString();
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
    const senderName = typeof message.senderId === 'object' 
      ? message.senderId?.name 
      : (isOwnMessage ? user.name : 'Unknown');

    return (
      <div key={message._id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-600 flex-shrink-0">
          {senderName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
            <span className="font-semibold text-white text-sm">
              {senderName}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt)}
            </span>
          </div>
          <div className={`rounded-lg p-3 max-w-xs ${
            isOwnMessage 
              ? 'bg-blue-600 ml-auto' 
              : 'bg-gray-700'
          }`}>
            <p className="text-white text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <div className="max-w-6xl mx-auto p-0 md:p-4 ">
        {error && (
          <div className="mb-4 p-3 bg-red-900 text-white rounded-lg">
            {error}
          </div>
        )}
        <div className="flex justify-between gap-5">
          {/* Groups List */}
          <div className={`lg:col-span-1  ${isMobile? "w-full" : "w-[40%] border border-gray-600"}  md:rounded-lg shadow-lg  ${isMobile && isOffcanvasOpen ? 'hidden' : ''}`}>
            <div className={`p-4  ${isMobile? "" : "border-b border-gray-600"}  flex justify-between items-center`}>
              <h2 className="font-semibold text-white">Your Groups</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="zap-btn flex items-center gap-2 hover:bg-gray-900 transition-transform duration-200"
              >
                <Plus size={20} className="text-white" />
                <span className="text-white">Create Group</span>
              </button>
            </div>
            <div className="flex flex-col h-[65vh] overflow-y-auto rounded-xl scrollbar-hidden shadow-xl">
              {groupChats.map((group) => (
                <div 
                  key={group._id}
                  onClick={() => handleSelectGroup(group)}
                  className={`p-4 m-3 border rounded-2xl  border-gray-700 cursor-pointer hover:bg-gray-900 transition-colors duration-200 ${
                    selectedGroup?._id === group._id ? 'bg-gray-800 border-gray-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{group.name}</h3>
                    {group.unreadCount > 0 && (
                      <span className="zap-secondary text-white text-xs px-2 py-1 rounded-full">
                        {group.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {(() => {
                      const groupMessages = allMessages?.filter((message) => message.chatId === group._id) || [];
                      return groupMessages.length > 0 
                        ? groupMessages[groupMessages.length - 1]?.content || 'No messages yet'
                        : 'No messages yet';
                    })()}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{group.lastTime || ''}</span>
                    <div className="flex -space-x-2">
                      {group.users?.slice(0, 3).map((participant) => (
                        <div 
                          key={participant._id}
                          className="w-7 h-7 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white"
                        >
                          <span>{participant.name?.[0] || participant._id?.[0] || '?'}</span>
                        </div>
                      ))}
                      {(group.users?.length || 0) > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-white">
                          +{group.users.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area - Desktop */}
          <div className={`lg:col-span-2 h-[75vh] w-[60%] bg-gray-800 rounded-lg shadow-lg flex-col hidden lg:flex`}>
            {selectedGroup ? (
              <>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="text-gray-400" size={24} />
                    <div>
                      <h2 className="font-bold text-white">{selectedGroup.name}</h2>
                      <p className="text-sm text-gray-400">{selectedGroup.users?.length || 0} participants</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowParticipants(!showParticipants)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Users className="text-gray-400" size={20} />
                    </button>
                    <button 
                      onClick={handleLeaveGroup}
                      className="p-2 hover:bg-red-900 rounded-lg transition-colors duration-200"
                    >
                      <UserMinus className="text-red-400" size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden bg-gray-800">
                  {isLoadingMessages ? (
                    <p className="text-gray-400 text-center">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-gray-400 text-center">No messages yet</p>
                  ) : (
                    messages.map((message) => renderMessage(message))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="zap-btn px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newMessage.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                {showParticipants && (
                  <div className="absolute right-4 top-20 bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-4 w-64 z-10">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-white">Participants</h3>
                      <button 
                        onClick={() => setShowParticipants(false)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedGroup.users?.map((participant) => (
                        <div key={participant._id} className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-600"
                          >
                            {participant.name?.[0] || participant._id?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{participant.name || participant._id || 'Unknown'}</p>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${participant.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                              <span className="text-xs text-gray-400">
                                {participant.online ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Select a group to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Create New Group</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add Users ({selectedUsers.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-600 rounded-lg bg-gray-800">
                  {users.filter(u => u._id !== user.id).map((userItem) => (
                    <div 
                      key={userItem._id}
                      onClick={() => toggleUserSelection(userItem)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                    >
                      <div className="relative">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-600"
                        >
                          {userItem.name?.[0] || userItem._id?.[0] || '?'}
                        </div>
                        {selectedUsers.find((u) => u._id === userItem._id) && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{userItem.name || userItem._id || 'Unknown'}</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${userItem.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <span className="text-xs text-gray-400">
                            {userItem.online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="zap-btn disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Offcanvas */}
      {isMobile && isOffcanvasOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeOffcanvas}
          />
          <div className="absolute inset-0 bg-gray-800">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3 ml-12">
                  <button 
                    onClick={closeOffcanvas}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                  <MessageCircle className="text-gray-400" size={24} />
                  <div>
                    <h2 className="font-bold text-white">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-400">{selectedGroup.users?.length || 0} participants</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Users className="text-gray-400" size={20} />
                  </button>
                  <button 
                    onClick={handleLeaveGroup}
                    className="p-2 hover:bg-red-900 rounded-lg transition-colors duration-200"
                  >
                    <UserMinus className="text-red-400" size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden bg-gray-800">
                {isLoadingMessages ? (
                  <p className="text-gray-400 text-center">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-gray-400 text-center">No messages yet</p>
                ) : (
                  messages.map((message) => renderMessage(message))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="zap-btn px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {showParticipants && (
                <div className="absolute inset-x-4 top-20 bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-4 z-10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white">Participants</h3>
                    <button 
                      onClick={() => setShowParticipants(false)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedGroup.users?.map((participant) => (
                      <div key={participant._id} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-600"
                        >
                          {participant.name?.[0] || participant._id?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{participant.name || participant._id || 'Unknown'}</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${participant.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className="text-xs text-gray-400">
                              {participant.online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChats;