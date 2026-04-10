import { useState, useEffect, useCallback, useRef } from 'react';
import { useGlobalSocket } from '../context/SocketContext';

export const useTypingIndicator = (selectedChatId, userId, otherUserId) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const { socket } = useGlobalSocket();
  
  // Refs to manage timers
  const typingTimer = useRef(null);
  const stopTypingTimer = useRef(null);

  // Listen for typing events from other users
  useEffect(() => {
    if (!socket || !selectedChatId) return;

    const handleUserStartTyping = (data) => {
        console.log(data);
        
      const { chatId, userId: typingUserId, userName } = data;
      
      if (chatId === selectedChatId && typingUserId !== userId) {
        setOtherUserTyping(true);
        
        // Clear any existing timer
        if (stopTypingTimer.current) {
          clearTimeout(stopTypingTimer.current);
        }
        
        // Auto-hide typing indicator after 3 seconds of no activity
        stopTypingTimer.current = setTimeout(() => {
          setOtherUserTyping(false);
        }, 3000);
      }
    };

    const handleUserStopTyping = (data) => {
      const { chatId, userId: typingUserId } = data;
      
      if (chatId === selectedChatId && typingUserId !== userId) {
        setOtherUserTyping(false);
        
        if (stopTypingTimer.current) {
          clearTimeout(stopTypingTimer.current);
        }
      }
    };

    socket.on('userStartTyping', handleUserStartTyping);
    socket.on('userStopTyping', handleUserStopTyping);

    return () => {
      socket.off('userStartTyping', handleUserStartTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    };
  }, [socket, selectedChatId, userId]);

  // Function to emit typing start
  const startTyping = useCallback(() => {
//    console.log(selectedChatId);
   
    
    if (!socket || !selectedChatId || isTyping) return;
//  console.log("typing...");
    setIsTyping(true);
    
    socket.emit('startTyping', {
      chatId: selectedChatId,
      userId,
      otherUserId
    });

    // Clear existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Stop typing after 2 seconds of no activity
    typingTimer.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [socket, selectedChatId, userId, otherUserId, isTyping]);

  // Function to emit typing stop
  const stopTyping = useCallback(() => {
    if (!socket || !selectedChatId || !isTyping) return;

    setIsTyping(false);
    
    socket.emit('stopTyping', {
      chatId: selectedChatId,
      userId,
      otherUserId
    });

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
  }, [socket, selectedChatId, userId, otherUserId, isTyping]);

  // Reset typing state when chat changes
  useEffect(() => {
    setIsTyping(false);
    setOtherUserTyping(false);
    
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    
    if (stopTypingTimer.current) {
      clearTimeout(stopTypingTimer.current);
      stopTypingTimer.current = null;
    }
  }, [selectedChatId]);

  return {
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping
  };
};