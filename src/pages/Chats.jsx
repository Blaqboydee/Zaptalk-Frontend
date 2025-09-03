import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Plus,
  MessageCircle,
  X,
  Send,
} from "lucide-react";
import { io } from "socket.io-client";
import { useUsers } from "../context/UsersContext";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(apiUrl);


export default function ChatsPage() {
  const messagesEndRef = useRef(null);
  const { user, allMessages } = useOutletContext();
  const navigate = useNavigate();
  const { users, loading } = useUsers();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [chatId, setChatId] = useState(null);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`${apiUrl}/chats?userId=${user.id}`);
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [user?.id]);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join chat room when selectedChatId changes
  useEffect(() => {
    if (!selectedChatId) return;
    
    console.log("Joining chat room:", selectedChatId);
    socket.emit("join_chat", selectedChatId);
    
    // Confirm we joined
    const handleJoinedChat = (roomId) => {
      console.log("Successfully joined chat:", roomId);
    };
    
    socket.on("joined_chat", handleJoinedChat);
    
    return () => {
      socket.off("joined_chat", handleJoinedChat);
      console.log("Left chat room:", selectedChatId);
    };
  }, [selectedChatId]);

  // Socket message handling
  useEffect(() => {
    const handleMessage = (msg) => {
      console.log("Received message via socket:", msg);
      
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m._id === msg._id)) {
          console.log("Message already exists, skipping");
          return prev;
        }
        
        // Remove any pending optimistic messages from the same sender with similar content and timestamp
        const filteredMessages = prev.filter((m) => {
          if (!m.pending) return true;
          
          // Remove optimistic message if it matches content and sender and was sent recently
          const isSameSender = (m.senderId?._id || m.senderId) === msg.senderId?._id;
          const isSameContent = m.content.trim() === msg.content.trim();
          const isRecent = new Date(msg.createdAt) - new Date(m.createdAt) < 5000; // Within 5 seconds
          
          if (isSameSender && isSameContent && isRecent) {
            console.log("Removing optimistic message:", m._id);
            return false;
          }
          return true;
        });
        
        console.log("Adding new message to UI");
        return [...filteredMessages, msg];
      });

      // Update chats list to show latest message
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === msg.chatId) {
            return {
              ...chat,
              lastMessage: msg,
              updatedAt: msg.createdAt
            };
          }
          return chat;
        });
      });
    };

    console.log("Setting up socket listener for receive_message");
    socket.on("receive_message", handleMessage);

    return () => {
      console.log("Cleaning up socket listener");
      socket.off("receive_message", handleMessage);
    };
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        setMessages([]);
        return;
      }
      
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`${apiUrl}/messages?chatId=${selectedChatId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
        } else {
          console.error("Failed to fetch messages");
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Send to server
      socket.emit("send_message", {
        content: messageContent,
        senderId: user.id,
        chatId: selectedChatId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message input on error
      setNewMessage(messageContent);
    }
  };

  const openChat = (chat) => {
    console.log("Opening chat:", chat);
    
    // Find the other user in the chat
    const secondUser = chat.users?.find((u) => u._id !== user.id);
    
    if (!secondUser) {
      console.error("Could not find other user in chat:", chat);
      return;
    }

    console.log("Setting other user:", secondUser);
    setOtherUser(secondUser);
    setSelectedChatId(chat._id);

    // if (!isMobile) {
    //   // alert("you are on dektop")
    //   return
    // }
    
    if (isMobile) {
      setIsOffcanvasOpen(true);
    }
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
    if (isMobile) {
      setSelectedChatId(null);
      setOtherUser(null);
      setMessages([]);
    }
  };

  const formatTime = (timestamp) => {
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

  return (
    <div className="">
      {/* Chats List */}
      <main className="lg:hidden flex-1 p-4 overflow-y-auto sm:px-6 lg:px-8">
        {chats.length > 0 ? (
          <div className="space-y-3">
            {chats.map((chat) => {
              const secondUser = chat.users?.find((u) => u._id !== user.id);
              const filteredMessages = allMessages?.filter(message => message.chatId === chat._id) || [];
              const lastMessage = filteredMessages[filteredMessages.length - 1] || chat.lastMessage;

              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className="cursor-pointer bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-700 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-gray-600">
                        {secondUser?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                          {chat.users?.length === 2
                            ? secondUser?.name || "Private Chat"
                            : chat.name || "Group Chat"}
                        </h2>
                        <span className="text-xs font-medium text-gray-400">
                          {lastMessage ? formatTime(lastMessage.createdAt) : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm truncate flex-1 mr-2 text-gray-400">
                          {lastMessage?.content || "No messages yet"}
                        </p>
                        {filteredMessages.length > 0 && (
                          <span className="zap-secondary text-white text-xs px-2 py-1 rounded-full font-medium">
                            {filteredMessages.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="mb-8 relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse bg-gray-500"></div>
              <div
                className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full animate-pulse bg-gray-500"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>

            <h2 className="text-2xl font-bold mb-3 text-white">No chats yet</h2>
            <p className="text-lg mb-8 max-w-md text-gray-400">
              Start your first conversation by connecting with other users on ZapTalk!
            </p>
            <button
              onClick={() => navigate("/users")}
              className="zap-btn px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
            >
              Find Users ⚡
            </button>
            <p className="text-sm text-gray-400">Discover people to chat with</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/users")}
        className="fixed bottom-6 right-6 w-16 h-16 text-white rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center z-50 zap-btn"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Desktop Chat view */}
      <div className="hidden bg-gray-800 w-full h-[70vh] lg:flex overflow-y-auto scrollbar-hidden">
          <div className="flex-1 p-4 overflow-y-auto sm:px-6 lg:px-8">
        {chats.length > 0 ? (
          <div className="space-y-3">
            {chats.map((chat) => {
              const secondUser = chat.users?.find((u) => u._id !== user.id);
              const filteredMessages = allMessages?.filter(message => message.chatId === chat._id) || [];
              const lastMessage = filteredMessages[filteredMessages.length - 1] || chat.lastMessage;

              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className="cursor-pointer bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-700 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-gray-600">
                        {secondUser?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                          {chat.users?.length === 2
                            ? secondUser?.name || "Private Chat"
                            : chat.name || "Group Chat"}
                        </h2>
                        <span className="text-xs font-medium text-gray-400">
                          {lastMessage ? formatTime(lastMessage.createdAt) : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm truncate flex-1 mr-2 text-gray-400">
                          {lastMessage?.content || "No messages yet"}
                        </p>
                        {filteredMessages.length > 0 && (
                          <span className="zap-secondary text-white text-xs px-2 py-1 rounded-full font-medium">
                            {filteredMessages.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="mb-8 relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse bg-gray-500"></div>
              <div
                className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full animate-pulse bg-gray-500"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>

            <h2 className="text-2xl font-bold mb-3 text-white">No chats yet</h2>
            <p className="text-lg mb-8 max-w-md text-gray-400">
              Start your first conversation by connecting with other users on ZapTalk!
            </p>
            <button
              onClick={() => navigate("/users")}
              className="zap-btn px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
            >
              Find Users ⚡
            </button>
            <p className="text-sm text-gray-400">Discover people to chat with</p>
          </div>
        )}
      </div>





         {selectedChatId &&  otherUser && (<div className="bg-gray-700 w-[60%] max-h-[70vh] overflow-auto scrollbar-hidden">
          
           <div className="w-full">
                  <div className="p-4 border-b border-gray-600 bg-white/10 backdrop-blur-md backdrop-saturate-150 flex justify-between items-center sticky top-0">
              <div className="flex items-center gap-3 ">
                <MessageCircle className="text-gray-400" size={24} />
                <div>
                  <h2 className="font-bold text-white">{otherUser.name || "Chat"}</h2>
                </div>
              </div>
            </div>
          <div className="">

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden h-[70vh] bg-gray-800">
              {isLoadingMessages ? (
                <div className="text-gray-400 text-center">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400 text-center">No messages yet</div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
                  const senderName = typeof message.senderId === 'object' 
                    ? message.senderId?.name 
                    : (isOwnMessage ? user.name : otherUser?.name);

                  return (
                    <div key={message._id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-600 flex-shrink-0">
                        {senderName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                          <span className="font-semibold text-white text-sm">
                            {senderName || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.createdAt ? formatTime(message.createdAt) : ""}
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-600 bg-gray-800 sticky bottom-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="zap-btn px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
          
          </div>)}
      </div>

      
     

        


     

     



      {/* Mobile Offcanvas */}
      {isMobile && isOffcanvasOpen && selectedChatId && otherUser && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute  inset-0 bg-black  bg-opacity-50"
            onClick={closeOffcanvas}
          />
          <div className="absolute inset-0 bg-gray-800 flex flex-col">
            <div className="h-[70px] border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-end justify-center ml-14 gap-3">
                <button
                  onClick={closeOffcanvas}
                  className="hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
                <MessageCircle className="text-gray-400" size={24} />
                <div>
                  <h2 className="font-bold text-white">{otherUser.name || "Chat"}</h2>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden bg-gray-800">
              {isLoadingMessages ? (
                <div className="text-gray-400 text-center">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400 text-center">No messages yet</div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
                  const senderName = typeof message.senderId === 'object' 
                    ? message.senderId?.name 
                    : (isOwnMessage ? user.name : otherUser?.name);

                  return (
                    <div key={message._id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-600 flex-shrink-0">
                        {senderName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                          <span className="font-semibold text-white text-sm">
                            {senderName || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.createdAt ? formatTime(message.createdAt) : ""}
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="zap-btn px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}