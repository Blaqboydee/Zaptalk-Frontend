import { useState, useEffect, useRef } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useGroupMessages = (selectedGroup, user, socket) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when group selection changes
  useEffect(() => {
    if (!selectedGroup) {
      setMessages([]);
      return;
    }

    // Join the group room via shared socket (in case it wasn't joined at login)
    if (socket) {
      socket.emit('join_chat', selectedGroup._id);
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`${apiUrl}/messages?chatId=${selectedGroup._id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
          setError(null);
        } else {
          throw new Error('Failed to fetch messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedGroup?._id, socket]);

  // Listen for incoming messages on the shared socket
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    const handleMessage = (message) => {
      // Only handle messages for the currently selected group
      if (message.chatId !== selectedGroup._id) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;

        // Remove optimistic pending message that matches
        const filtered = prev.filter((m) => {
          if (!m.pending) return true;
          const sameSender =
            (m.senderId?._id || m.senderId) ===
            (message.senderId?._id || message.senderId);
          const sameContent = m.content.trim() === message.content.trim();
          const recent = new Date(message.createdAt) - new Date(m.createdAt) < 5000;
          return !(sameSender && sameContent && recent);
        });

        return [...filtered, message];
      });
    };

    socket.on('receive_message', handleMessage);
    return () => socket.off('receive_message', handleMessage);
  }, [socket, selectedGroup?._id]);

  const sendMessage = (messageContent) => {
    if (!messageContent.trim() || !selectedGroup || !socket) return;

    socket.emit('send_message', {
      content: messageContent,
      senderId: user.id,
      chatId: selectedGroup._id,
    });
    setError(null);
  };

  return { messages, isLoadingMessages, messagesEndRef, sendMessage, error, setError };
};