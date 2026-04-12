import { useState, useEffect, useCallback, useRef } from 'react';
import { useGlobalSocket } from '../context/SocketContext';

export const useTypingIndicator = (selectedChatId, userId, otherUserId) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [ghostText, setGhostText] = useState('');
  const { socket } = useGlobalSocket();
  
  // Refs to manage timers
  const typingTimer = useRef(null);
  const stopTypingTimer = useRef(null);
  const ghostTimer = useRef(null);

  // Listen for typing events from other users
  useEffect(() => {
    if (!socket || !selectedChatId) return;

    const handleUserStartTyping = (data) => {
      const { chatId, userId: typingUserId, userName } = data;
      
      if (chatId === selectedChatId && typingUserId !== userId) {
        setOtherUserTyping(true);
        
        if (stopTypingTimer.current) {
          clearTimeout(stopTypingTimer.current);
        }
        
        stopTypingTimer.current = setTimeout(() => {
          setOtherUserTyping(false);
          setGhostText('');
        }, 3000);
      }
    };

    const handleUserStopTyping = (data) => {
      const { chatId, userId: typingUserId } = data;
      
      if (chatId === selectedChatId && typingUserId !== userId) {
        setOtherUserTyping(false);
        setGhostText('');
        
        if (stopTypingTimer.current) {
          clearTimeout(stopTypingTimer.current);
        }
      }
    };

    // Ghost typing listeners
    const handleGhostUpdate = (data) => {
      if (data.chatId === selectedChatId && data.userId !== userId) {
        setGhostText(data.text);
        setOtherUserTyping(true);

        if (ghostTimer.current) clearTimeout(ghostTimer.current);
        ghostTimer.current = setTimeout(() => {
          setGhostText('');
          setOtherUserTyping(false);
        }, 4000);
      }
    };

    const handleGhostCleared = (data) => {
      if (data.chatId === selectedChatId && data.userId !== userId) {
        setGhostText('');
      }
    };

    socket.on('userStartTyping', handleUserStartTyping);
    socket.on('userStopTyping', handleUserStopTyping);
    socket.on('ghostTypingUpdate', handleGhostUpdate);
    socket.on('ghostTypingCleared', handleGhostCleared);

    return () => {
      socket.off('userStartTyping', handleUserStartTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      socket.off('ghostTypingUpdate', handleGhostUpdate);
      socket.off('ghostTypingCleared', handleGhostCleared);
      
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
      if (ghostTimer.current) clearTimeout(ghostTimer.current);
    };
  }, [socket, selectedChatId, userId]);

  // Emit ghost typing on every keystroke
  const emitGhostTyping = useCallback((text) => {
    if (!socket || !selectedChatId) return;
    socket.emit('ghostTyping', { chatId: selectedChatId, userId, text });
  }, [socket, selectedChatId, userId]);

  // Function to emit typing start
  const startTyping = useCallback(() => {
    if (!socket || !selectedChatId || isTyping) return;

    setIsTyping(true);
    
    socket.emit('startTyping', {
      chatId: selectedChatId,
      userId,
      otherUserId
    });

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

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

    socket.emit('ghostTypingStop', { chatId: selectedChatId, userId });

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
  }, [socket, selectedChatId, userId, otherUserId, isTyping]);

  // Reset typing state when chat changes
  useEffect(() => {
    setIsTyping(false);
    setOtherUserTyping(false);
    setGhostText('');
    
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    
    if (stopTypingTimer.current) {
      clearTimeout(stopTypingTimer.current);
      stopTypingTimer.current = null;
    }

    if (ghostTimer.current) {
      clearTimeout(ghostTimer.current);
      ghostTimer.current = null;
    }
  }, [selectedChatId]);

  return {
    isTyping,
    otherUserTyping,
    ghostText,
    startTyping,
    stopTyping,
    emitGhostTyping,
  };
};