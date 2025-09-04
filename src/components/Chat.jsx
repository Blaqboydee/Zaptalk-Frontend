import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); 

export default function ChatScreen({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  console.log(location.state);
  console.log(user);
  
  const { otherUserId, otherUserName } = location.state || {};

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  console.log(messages);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join chat room whenever chatId changes
  useEffect(() => {
    if (!chatId) return;
    
    console.log("Joining chat room:", chatId);
    socket.emit("join_chat", chatId);
    
    // Confirm we joined
    socket.on("joined_chat", (roomId) => {
      console.log("Successfully joined chat:", roomId);
    });
    
    return () => {
      socket.off("joined_chat");
    };
  }, [chatId]);

  // Listen for real-time messages - Simplified
  useEffect(() => {
    const handleMessage = (msg) => {
      console.log("Received message via socket:", msg);
      
      setMessages((prev) => {
        // Simple duplicate check - just check if message ID already exists
        if (prev.some((m) => m._id === msg._id)) {
          console.log("Message already exists, skipping");
          return prev;
        }
        
        console.log("Adding new message to UI");
        return [...prev, msg];
      });
    };

    console.log("Setting up socket listener for receive_message");
    socket.on("receive_message", handleMessage);

    return () => {
      console.log("Cleaning up socket listener");
      socket.off("receive_message", handleMessage);
    };
  }, []);

  const [isInitializing, setIsInitializing] = useState(false);
  const initChatRef = useRef(false);

  // Initialize 1-on-1 chat
  useEffect(() => {
    if (!user.id || !otherUserId || initChatRef.current) return;

    const initChat = async () => {
      console.log("🚀 initChat started for:", user.id, otherUserId);
      initChatRef.current = true; // Set flag immediately
      setIsInitializing(true);
      
      try {
        // First, get or create the chat
        const chatRes = await fetch("http://localhost:5000/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userIds: [user.id, otherUserId],
            isDirect: true,
          }),
        });

        if (!chatRes.ok) {
          const errData = await chatRes.json();
          console.error("Backend error:", errData);
          return;
        }

        const chatData = await chatRes.json();
        setChatId(chatData._id);

        // The chat already comes with populated messages, so use them
        // But also fetch fresh messages in case some are missing
        const messagesRes = await fetch(`http://localhost:5000/messages?chatId=${chatData._id}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData || []);
        } else {
          // Fallback to messages from chat data
          setMessages(chatData.messages || []);
        }

        console.log("✅ initChat finished successfully");
      } catch (err) {
        console.error("Error initializing chat:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [user.id, otherUserId]);

  // Send message - Simplified approach
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageData = {
      content: newMessage,
      senderId: user.id,
      chatId: chatId,
    };

    console.log("Sending message:", messageData);
    setNewMessage("");

    // Just emit via socket - no optimistic update to avoid conflicts
    socket.emit("send_message", messageData);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className=" bg-gray-900 md:ml-64">
      {/* Header */}
      <div className="zap-header relative">
        <div className="flex items-center space-x-4 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white bg-gray-600">
            {otherUserName?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">{otherUserName || 'Chat'}</h2>
            <p className="text-sm text-gray-400">
              {isInitializing ? 'Connecting...' : 'Active now'}
            </p>
          </div>

          {/* Menu Button */}
          <button className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-red-800 scrollbar-hidden">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full animate-pulse bg-gray-500"></div>
              <div className="w-3 h-3 rounded-full animate-pulse bg-gray-500" style={{ animationDelay: '200ms' }}></div>
              <div className="w-3 h-3 rounded-full animate-pulse bg-gray-500" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg bg-gray-600">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start the conversation</h3>
            <p className="text-gray-400">Send your first message to {otherUserName}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.senderId._id === user.id;
            const showTime = index === 0 || 
              (index > 0 && new Date(msg.createdAt).getTime() - new Date(messages[index-1].createdAt).getTime() > 300000); // 5 minutes
            
            return (
              <div key={msg._id} className="space-y-1">
                {showTime && (
                  <div className="text-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar for other user */}
                    {!isMyMessage && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-gray-600">
                        {otherUserName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                      isMyMessage 
                        ? 'rounded-br-md bg-gray-600 text-white' 
                        : 'rounded-bl-md bg-gray-700 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      
                      {/* Message tail */}
                      {isMyMessage ? (
                        <div className="absolute bottom-0 right-0 w-4 h-4 overflow-hidden">
                          <div className="w-3 h-3 transform rotate-45 translate-x-1 translate-y-1 bg-gray-600"></div>
                        </div>
                      ) : (
                        <div className="absolute bottom-0 left-0 w-4 h-4 overflow-hidden">
                          <div className="w-3 h-3 transform rotate-45 -translate-x-1 translate-y-1 bg-gray-700"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button className="p-3 rounded-full hover:bg-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-3 rounded-2xl resize-none transition-all duration-200 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="zap-btn p-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center mt-3 space-x-4">
          <button className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm text-gray-400 hover:bg-gray-700 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>React</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm text-gray-400 hover:bg-gray-700 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
            </svg>
            <span>GIF</span>
          </button>
        </div>
      </div>
    </div>
  );
}