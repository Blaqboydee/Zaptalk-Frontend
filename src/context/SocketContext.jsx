// context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { Toaster, toast } from 'sonner';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const chatUpdateCallbackRef = useRef(null);

  // Create socket when user logs in
  useEffect(() => {
    if (!user) return;

    const newSocket = io(apiUrl, { withCredentials: true });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Emit "user-online" on connect
  useEffect(() => {
    if (!socket || !user) return;

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("user-online", user.id);
    };

    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, user]);

  // Join user chats after login
  useEffect(() => {
    if (!socket || !user) return;

    const fetchUserChats = async () => {
      try {
        const res = await axios.get(`${apiUrl}/chats/user/${user.id}`);
        const chatIds = res.data.map((chat) => chat._id);

        socket.emit("join_chats", chatIds);
        console.log("Joined chats:", chatIds);
      } catch (err) {
        console.error("Failed to fetch user chats:", err);
      }
    };

    fetchUserChats();
  }, [socket, user]);

  // Handle receiving messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.senderId._id === user?.id) return;

      if (!isChatOpen) {
        console.log(`New message from ${msg.senderId.name}`);
        toast.success(`New message from ${msg.senderId.name}`);
      }

      console.log("Global message received:", msg);
      setMessages((prev) => [...prev, msg]);
      setNewMessage(msg);

      if (chatUpdateCallbackRef.current) {
        chatUpdateCallbackRef.current(msg.chatId, msg);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, isChatOpen, user]);

  // Emit message
  const sendMessage = (data) => {
    if (socket) {
      socket.emit("send_message", data);
    }
  };

  // Allow components to register a callback for chat updates
  const registerChatUpdateCallback = (callback) => {
    chatUpdateCallbackRef.current = callback;
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        sendMessage,
        isChatOpen,
        setIsChatOpen,
        newMessage,
        registerChatUpdateCallback,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useGlobalSocket = () => useContext(SocketContext);
