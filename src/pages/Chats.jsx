import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { Plus, MessageCircle, X, Send } from "lucide-react";
import { io } from "socket.io-client";
import { useUsers } from "../context/UsersContext";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(apiUrl);

const ChatListItem = ({ chat, user, allMessages, openChat }) => {
  const secondUser = chat.users?.find((u) => u._id !== user.id);
  const filteredMessages = allMessages?.filter(message => message.chatId === chat._id) || [];
  const lastMessage = filteredMessages[filteredMessages.length - 1] || chat.lastMessage;

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    return (now - messageDate) / (1000 * 60 * 60) < 24
      ? messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : messageDate.toLocaleDateString();
  };

  return (
    <div
      onClick={() => openChat(chat)}
      className="cursor-pointer bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700 hover:-translate-y-1 group hover:border-orange-500/30 hover:shadow-orange-500/10"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-gradient-to-br from-orange-400 to-orange-600">
            {secondUser?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-white group-hover:text-orange-300 transition-colors">
              {chat.users?.length === 2 ? secondUser?.name || "Private Chat" : chat.name || "Group Chat"}
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
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {filteredMessages.length}
              </span>
            )}
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-orange-300 transition-colors duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const ChatMessages = ({ messages, user, otherUser, isLoadingMessages, messagesEndRef, formatTime }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden h-[calc(70vh-120px)] bg-gray-800">
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 shadow-lg">
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
              <div className={`rounded-lg p-3 max-w-xs ${isOwnMessage ? 'bg-gradient-to-r from-orange-500 to-orange-600 ml-auto' : 'bg-gray-700'}`}>
                <p className="text-white text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        );
      })
    )}
    <div ref={messagesEndRef} />
  </div>
);

const FriendsList = ({ allNewFriends, initChat }) => (
  <div className="bg-gray-800/80 round backdrop-blur-md border-b border-gray-700/50 py-4">
    <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-lg font-semibold text-white mb-3">Friends</h3>
      <div className=" overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 h-[70px]  w-[100%] scrollbar-track-gray-800">
        <div className="flex gap-3 max-w-[300px] ">
          {allNewFriends.map((friend) => (
            <button
              key={friend.otherUserId || friend.otherUserName} // Use otherUserId as primary key
              className="group relative flex items-center gap-3 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/70 rounded-xl border border-gray-600/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-105 flex-shrink-0"
               onClick={()=>{initChat(friend)}}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {friend.otherUserName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-medium text-sm group-hover:text-orange-300 transition-colors">
                  {friend.otherUserName || 'Unknown User'}
                </span>
                <span className="text-gray-400 text-xs">Click to chat</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function ChatsPage() {
  const { user, allMessages } = useOutletContext();
  const navigate = useNavigate();
  const { users, loading } = useUsers();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [allNewFriends, setAllNewFriends] = useState(() => {
    const saved = localStorage.getItem("friends");
    if (!saved) return [];
    
    // Clean up duplicates in localStorage on mount
    const friends = JSON.parse(saved);
    const uniqueFriends = Array.from(
      new Map(
        friends.map(f => [f.otherUserId || f.otherUserName?.toLowerCase(), f])
      ).values()
    );
    localStorage.setItem("friends", JSON.stringify(uniqueFriends));
    return uniqueFriends;
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    return (now - messageDate) / (1000 * 60 * 60) < 24
      ? messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : messageDate.toLocaleDateString();
  };


    const [isInitializing, setIsInitializing] = useState(false);
    const initChatRef = useRef(false);

  // Initialize 1-on-1 chat
 const initChat = async (friend) => {
  console.log("🚀 initChat started for:", user.id, friend.otherUserId);
  initChatRef.current = true;
  setIsInitializing(true);

  try {
    // Check if a chat already exists
    const existingChat = chats.find((chat) =>
      chat.isDirect &&
      chat.users.some((u) => u._id === user.id) &&
      chat.users.some((u) => u._id === friend.otherUserId)
    );

    if (existingChat) {
      setSelectedChatId(existingChat._id);
      setOtherUser({ _id: friend.otherUserId, name: friend.otherUserName });
      const messagesRes = await fetch(`${apiUrl}/messages?chatId=${existingChat._id}`);
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData || []);
      }
      if (isMobile) setIsOffcanvasOpen(true);
      console.log("✅ Using existing chat");
      return;
    }

    // Create new chat if none exists
    const chatRes = await fetch(`${apiUrl}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: [user.id, friend.otherUserId],
        isDirect: true,
      }),
    });

    if (!chatRes.ok) {
      const errData = await chatRes.json();
      console.error("Backend error:", errData);
      return;
    }

    const chatData = await chatRes.json();
    setSelectedChatId(chatData._id);
    setChats((prev) => {
      if (prev.some((chat) => chat._id === chatData._id)) return prev;
      return [...prev, chatData];
    });
    setOtherUser({ _id: friend.otherUserId, name: friend.otherUserName });

    const messagesRes = await fetch(`${apiUrl}/messages?chatId=${chatData._id}`);
    if (messagesRes.ok) {
      const messagesData = await messagesRes.json();
      setMessages(messagesData || []);
    } else {
      setMessages(chatData.messages || []);
    }

    console.log("initChat finished successfully");
    if (isMobile) setIsOffcanvasOpen(true);
  } catch (err) {
    console.error("Error initializing chat:", err);
  } finally {
    setIsInitializing(false);
    initChatRef.current = false;
  }
};

  useEffect(() => {
    // Clean up duplicates in localStorage on mount
    const saved = localStorage.getItem("friends");
    if (saved) {
      const friends = JSON.parse(saved);
      const uniqueFriends = Array.from(
        new Map(
          friends.map(f => [f.otherUserId || f.otherUserName?.toLowerCase(), f])
        ).values()
      );
      if (uniqueFriends.length !== friends.length) {
        localStorage.setItem("friends", JSON.stringify(uniqueFriends));
        setAllNewFriends(uniqueFriends);
      }
    }
  }, []);

  // Fixed: Remove allNewFriends from dependency array to prevent infinite loop
  useEffect(() => {
    const newFriend = location.state;
    if (newFriend && newFriend.otherUserId) {
      setAllNewFriends(prev => {
        // Check for duplicates using otherUserId primarily, then otherUserName
        const isDuplicate = prev.some(f => 
          (f.otherUserId && f.otherUserId === newFriend.otherUserId) || 
          (f.otherUserName && newFriend.otherUserName && 
           f.otherUserName.toLowerCase() === newFriend.otherUserName.toLowerCase())
        );

        if (isDuplicate) {
          return prev; // Return previous state if duplicate found
        }

        const updated = [...prev, newFriend];
        localStorage.setItem("friends", JSON.stringify(updated));
        return updated;
      });
    }
  }, [location.state]); // Only depend on location.state

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${apiUrl}/chats?userId=${user.id}`);
        if (res.ok) {
          setChats(await res.json());
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    fetchChats();
  }, [user?.id]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChatId) return;
    socket.emit("join_chat", selectedChatId);
    return () => socket.off("joined_chat");
  }, [selectedChatId]);

  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.chatId !== selectedChatId) return;
      
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev.filter(m => !m.pending), msg];
      });

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === msg.chatId
            ? { ...chat, lastMessage: msg, updatedAt: msg.createdAt }
            : chat
        )
      );
    };

    socket.on("receive_message", handleMessage);
    return () => socket.off("receive_message", handleMessage);
  }, [selectedChatId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        setMessages([]);
        return;
      }
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`${apiUrl}/messages?chatId=${selectedChatId}`);
        setMessages(res.ok ? await res.json() : []);
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
      socket.emit("send_message", {
        content: messageContent,
        senderId: user.id,
        chatId: selectedChatId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageContent);
    }
  };

  const openChat = (chat) => {
    const secondUser = chat.users?.find((u) => u._id !== user.id);
    if (!secondUser) return;
    
    setOtherUser(secondUser);
    setSelectedChatId(chat._id);
    if (isMobile) setIsOffcanvasOpen(true);
  };




  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
    if (isMobile) {
      setSelectedChatId(null);
      setOtherUser(null);
      setMessages([]);
    }
  };

  return (
    <div className="flex h-[80vh] bg-gray-900">
      <div className="flex-1 flex flex-col">
        {allNewFriends.length > 0 && (
  <FriendsList
    allNewFriends={allNewFriends}
    chats={chats}
    openChat={openChat}
    initChat={initChat} // Add initChat here
  />
)}
        
        <main className="flex-1 p-4 overflow-y-auto sm:px-6 lg:px-8">
          {chats.length > 0 ? (
            <div className="space-y-3">
              {chats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  user={user}
                  allMessages={allMessages}
                  openChat={openChat}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="mb-8 relative">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-400 to-orange-600">
                  <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse bg-orange-400"></div>
                <div className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full animate-pulse bg-orange-500" style={{ animationDelay: "300ms" }}></div>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">No chats yet</h2>
              <p className="text-lg mb-8 max-w-md text-gray-400">
                Start your first conversation by connecting with other users on ZapTalk!
              </p>
              <button
                onClick={() => navigate("/users")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold text-lg hover:from-orange-600 hover:to-orange-700"
              >
                Find Users ⚡
              </button>
            </div>
          )}
        </main>

        <button
          onClick={() => navigate("/users")}
          className="fixed bottom-6 right-6 w-16 h-16 text-white rounded-full shadow-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-110 flex items-center justify-center z-50"
        >
          <Plus className="w-8 h-8" />
        </button>

        {selectedChatId && otherUser && !isMobile && (
          <div className="bg-gray-700 w-[60%] max-h-[70vh] overflow-auto scrollbar-hidden">
            <div className="p-4 border-b border-gray-600 bg-white/10 backdrop-blur-md flex items-center gap-3 sticky top-0">
              <MessageCircle className="text-orange-400" size={24} />
              <h2 className="font-bold text-white">{otherUser.name || "Chat"}</h2>
            </div>
            <ChatMessages
              messages={messages}
              user={user}
              otherUser={otherUser}
              isLoadingMessages={isLoadingMessages}
              messagesEndRef={messagesEndRef}
              formatTime={formatTime}
            />
            <div className="p-4 border-t border-gray-600 bg-gray-800 sticky bottom-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {isMobile && isOffcanvasOpen && selectedChatId && otherUser && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeOffcanvas} />
            <div className="absolute inset-0 bg-gray-800 flex flex-col">
              <div className="h-[70px]  border-b border-gray-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-3 ">
                  <button onClick={closeOffcanvas} className="hover:bg-gray-700 rounded-full p-2 transition-colors">
                    <X size={20} className="text-white" />
                  </button>
                  <MessageCircle className="text-orange-400" size={24} />
                  <h2 className="font-bold text-white">{otherUser.name || "Chat"}</h2>
                </div>
              </div>
              <ChatMessages
                messages={messages}
                user={user}
                otherUser={otherUser}
                isLoadingMessages={isLoadingMessages}
                messagesEndRef={messagesEndRef}
                formatTime={formatTime}
              />
              <div className="p-4 border-t border-gray-600">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}