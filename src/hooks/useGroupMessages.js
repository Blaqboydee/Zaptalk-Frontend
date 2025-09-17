import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(apiUrl);

export const useGroupMessages = (selectedGroup, user) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages and setup socket
  useEffect(() => {
    if (!selectedGroup) {
      setMessages([]);
      return;
    }

    socket.emit("join_chat", selectedGroup._id);

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
      socket.emit("leave_chat", selectedGroup._id);
    };
  }, [selectedGroup]);
  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        
        const filteredMessages = prev.filter((m) => {
          if (!m.pending) return true;
          
          const isSameSender = (m.senderId?._id || m.senderId) === message.senderId?._id;
          const isSameContent = m.content.trim() === message.content.trim();
          const isRecent = new Date(message.createdAt) - new Date(m.createdAt) < 5000;
          
          return !(isSameSender && isSameContent && isRecent);
        });
        
        return [...filteredMessages, message];
      });
    };

    socket.on("receive_message", handleMessage);
    return () => socket.off("receive_message", handleMessage);
  }, []);
  const sendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedGroup) return;

    try {
      socket.emit("send_message", {
        content: messageContent,
        senderId: user.id,
        chatId: selectedGroup._id,
      });
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      throw err;
    }
  };

  return {
    messages,
    isLoadingMessages,
    messagesEndRef,
    sendMessage,
    error: error,
    setError
  };
};