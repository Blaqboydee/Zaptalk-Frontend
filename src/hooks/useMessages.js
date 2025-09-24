import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useGlobalSocket } from '../context/SocketContext';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useMessages = (selectedChatId, userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get socket instance from context
  const { socket } = useGlobalSocket();

  // Keep the latest messages in a ref (prevents stale closures)
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);


useEffect(() => {
  if (!socket || !selectedChatId) return;

  // console.log('Setting up socket listeners for chat:', selectedChatId);
  // console.log('Socket connected:', socket.connected);
  // console.log('Socket ID:', socket.id);

  const handleMessageDeleted = (data) => {
    console.log('🔥 Frontend received messageDeleted:', data);
    
    const { messageId, chatId } = data;
    
    if (chatId === selectedChatId) {
      console.log('✅ Chat ID matches, deleting message:', messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } else {
      console.log('❌ Chat ID mismatch. Expected:', selectedChatId, 'Got:', chatId);
    }
  };

  // Test if socket is receiving ANY events
  socket.onAny((eventName, ...args) => {
    // console.log('📡 Socket received event:', eventName, args);
  });

  socket.on('messageDeleted', handleMessageDeleted);

 return () => {
    socket.off('messageDeleted', handleMessageDeleted);
    socket.offAny(); // Clean up the debug listener
  };
}, [socket, selectedChatId]);











  // Socket event listeners for real-time message updates
  useEffect(() => {
    if (!socket || !selectedChatId) return;

    // Listen for message edits
    const handleMessageEdited = (data) => {
      const { messageId, content, chatId } = data;
      
      if (chatId === selectedChatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId 
              ? { ...msg, content, edited: true, updatedAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    // Listen for message deletions
    const handleMessageDeleted = (data) => {
      // console.log(data);
      
      const { messageId, chatId } = data;
      
      if (chatId === selectedChatId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    };

    // Register socket listeners
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);

    // Cleanup listeners
    return () => {
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
    };
  }, [socket, selectedChatId]);

  // Fetch messages when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const res = await fetch(`${apiUrl}/messages?chatId=${selectedChatId}`);
        const data = res.ok ? await res.json() : [];
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add new message function
  const addMessage = useCallback((message) => {
    if (!message) return;

    setMessages((prev) => {
      // If this is a real message from server, remove any pending messages with same content and sender
      const withoutPending = message.pending ? prev : prev.filter(m => 
        !(m.pending && 
          m.content === message.content && 
          (m.senderId === message.senderId || m.senderId === message.senderId?._id)
        )
      );

      // Check if this exact message already exists (avoid duplicates)
      const messageExists = withoutPending.some(m => m._id === message._id);
      if (messageExists) return prev;

      // Add the new message
      const newMessages = [...withoutPending, message];
      
      // Sort by creation date to ensure proper order
      return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
  }, []);

  // Edit message function - NOW WITH REAL-TIME SYNC
  const editMessage = useCallback(async (messageId, newContent) => {
    if (!messageId || !newContent?.trim()) {
      throw new Error('Invalid message ID or content');
    }

    const originalMessage = messagesRef.current.find(msg => msg._id === messageId);
    if (!originalMessage) throw new Error('Message not found');

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, content: newContent.trim(), edited: true } : msg
      )
    );

    try {
      const response = await fetch(`${apiUrl}/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim(), userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to edit message');

      // Emit socket event for real-time sync to other users
      if (socket) {
        socket.emit('editMessage', {
          messageId,
          content: newContent.trim(),
          chatId: selectedChatId,
          userId
        });
      }

      // Update with server response
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, ...data, edited: true } : msg
        )
      );

      return data;
    } catch (error) {
      console.error("Error editing message:", error);
      // Rollback on error
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? originalMessage : msg))
      );
      throw error;
    }
  }, [userId, socket, selectedChatId]);

  // Delete message function - NOW WITH REAL-TIME SYNC
  const deleteMessage = useCallback(async (messageId) => {
    const messageToDelete = messagesRef.current.find(msg => msg._id === messageId);
    if (!messageToDelete) {
      console.warn("Message not found");
      return;
    }

    // Optimistic update
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

    try {
      if (socket) {
        socket.emit('deleteMessage', {
          messageId,
          chatId: selectedChatId,
          userId
        });
        // console.log("messagedeleted");
        
      }

    } catch (error) {
      console.error("Error deleting message:", error);
      // Rollback on error
      setMessages((prev) => {
        const newMessages = [...prev, messageToDelete];
        return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      throw error;
    }
  }, [userId, socket, selectedChatId]);

  // Clear messages function
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoadingMessages,
    messagesEndRef,
    addMessage,
    editMessage,
    deleteMessage,
    setMessages,
    clearMessages,
  };
};