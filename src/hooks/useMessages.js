import { useState, useEffect, useRef } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useMessages = (selectedChatId) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === message._id)) return prev;
      return [...prev.filter(m => !m.pending), message];
    });
  };

  return { 
    messages, 
    isLoadingMessages, 
    messagesEndRef, 
    addMessage, 
    setMessages 
  };
};