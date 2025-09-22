import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/formatTime';

const ChatMessages = ({ messages, user, otherUser, isLoadingMessages, messagesEndRef, isMobile, onEditMessage, onDeleteMessage }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const modalRef = useRef(null);
  const editInputRef = useRef(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedMessage(null);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Cleanup timer on unmount and when timer changes
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // Clear modal state when messages change or selected message is no longer available
  useEffect(() => {
    if (selectedMessage && messages) {
      const messageExists = messages.some(msg => msg._id === selectedMessage._id);
      if (!messageExists) {
        setSelectedMessage(null);
        setIsEditing(false);
      }
    }
  }, [messages, selectedMessage]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  }, [longPressTimer]);

  const handleLongPressStart = useCallback((message, event) => {
    // Only allow actions on own messages
    const isOwnMessage = message.senderId?._id === user?.id || message.senderId === user?.id;
    if (!isOwnMessage || !user) return;

    // Clear any existing timer
    clearLongPressTimer();

    // Capture the bounding rect immediately while event is still valid
    const rect = event.currentTarget?.getBoundingClientRect();
    if (!rect) return; // Safety check

    setIsLongPressing(true);
    
    const timer = setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const viewportWidth = window.innerWidth;
      const modalWidth = 150; // Approximate modal width
      
      // Adjust position to prevent modal from going off-screen
      let xPos = rect.right + 10;
      if (xPos + modalWidth > viewportWidth) {
        xPos = rect.left - modalWidth + 10; // Position to the left instead
      }
      
      setModalPosition({
        x: Math.max(10, xPos), // Ensure minimum 10px from edge
        y: rect.top + scrollTop
      });
      
      setSelectedMessage(message);
      setEditText(message.content || '');
      setIsLongPressing(false);
    }, 500); // 500ms long press duration
    
    setLongPressTimer(timer);
  }, [user, clearLongPressTimer]);

  const handleLongPressEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || !selectedMessage) return;
    
    try {
      // Call parent callback if provided
      if (onEditMessage) {
        await onEditMessage(selectedMessage._id, editText.trim());
      } else {
        // Fallback to dummy API call
        await editMessage(selectedMessage._id, editText.trim());
      }
      
      setIsEditing(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
      // You might want to show an error toast here
    }
  }, [editText, selectedMessage, onEditMessage]);

  const handleCancelEdit = useCallback(() => {
    setEditText(selectedMessage?.content || '');
    setIsEditing(false);
  }, [selectedMessage]);

  const handleDelete = useCallback(async () => {
    if (!selectedMessage) return;
    
    try {
      // Call parent callback if provided
      if (onDeleteMessage) {
        await onDeleteMessage(selectedMessage._id);
      } else {
        // Fallback to dummy API call
        await deleteMessage(selectedMessage._id);
      }
      
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      // You might want to show an error toast here
    }
  }, [selectedMessage, onDeleteMessage]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // Dummy API functions (fallbacks)
  const editMessage = async (messageId, newContent) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Editing message ${messageId} with content: ${newContent}`);
        resolve({ success: true });
      }, 500);
    });
  };

  const deleteMessage = async (messageId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Deleting message ${messageId}`);
        resolve({ success: true });
      }, 300);
    });
  };

  // Early return if user is not available
  if (!user) {
    return <div className="text-gray-400 text-center">Loading...</div>;
  }

  return (
    <>
      <div className={`overflow-y-auto p-4 space-y-6 scrollbar-hidden ${isMobile ? 'h-[calc(100vh-120px)]' : 'h-[calc(78vh-120px)]'}`}>
        {isLoadingMessages ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet</div>
        ) : (
          messages.map((message) => {
            // Ensure message has required properties
            if (!message?._id) return null;

            const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
            const senderName = typeof message.senderId === 'object' 
              ? message.senderId?.name 
              : (isOwnMessage ? user.name : otherUser?.name);

            return (
              <div key={message._id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 w-[85%] ${isOwnMessage ? 'text-right' : ''}`}>
                  <div 
                    className={`
                      relative inline-block max-w-[75%] min-w-[120px]
                      ${isOwnMessage ? 'ml-auto' : 'mr-auto'}
                    `}
                  >
                    {/* Main balloon body */}
                    <div 
                      onMouseDown={(e) => handleLongPressStart(message, e)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onTouchStart={(e) => handleLongPressStart(message, e)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                      className={`
                        px-5 py-2 relative select-none cursor-pointer
                        ${isOwnMessage 
                          ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600' 
                          : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
                        }
                        shadow-xl transform transition-all duration-200
                        ${isLongPressing && selectedMessage?._id === message._id ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                        ${isOwnMessage ? 'hover:shadow-orange-500/25' : 'hover:shadow-gray-500/25'}
                      `}
                      style={{
                        borderRadius: isOwnMessage 
                          ? '25px 25px 8px 25px' 
                          : '25px 25px 25px 8px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                        background: isOwnMessage
                          ? 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)'
                          : 'linear-gradient(135deg, #4b5563 0%, #374151 50%, #1f2937 100%)'
                      }}
                    >
                      {/* Highlight effect */}
                      <div 
                        className="absolute top-2 left-3 w-6 h-6 bg-white opacity-20 rounded-full blur-sm pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)'
                        }}
                      />
                      
                      {/* Message content */}
                      <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap mb-1 relative z-10">
                        {message.content || ''}
                        {message.edited && (
                          <span className="text-[10px] opacity-60 ml-2">(edited)</span>
                        )}
                      </p>
                      
                      {/* Timestamp */}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mt-2`}>
                        <span className="text-[10px] text-white opacity-70 relative z-10">
                          {message.createdAt ? formatTime(message.createdAt) : ""}
                        </span>
                      </div>
                    </div>
                    
                    {/* Extra bubble shine effect */}
                    <div 
                      className={`
                        absolute top-1 opacity-30 rounded-full bg-white blur-[1px] pointer-events-none
                        ${isOwnMessage ? 'right-4' : 'left-4'}
                      `}
                      style={{
                        width: '12px',
                        height: '8px',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.6), transparent)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Options Modal */}
      {selectedMessage && (
        <div
          ref={modalRef}
          className="fixed z-50 bg-gray-800 rounded-xl shadow-2xl border border-gray-600 backdrop-blur-md"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
            transform: 'translateY(-50%)',
            minWidth: isEditing ? '300px' : '150px',
            maxWidth: '90vw' // Prevent modal from being too wide on small screens
          }}
        >
          {isEditing ? (
            // Edit Mode
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-white text-sm font-medium">Edit Message</span>
              </div>
              
              <textarea
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none resize-none text-sm"
                rows="3"
                maxLength="500"
                placeholder="Enter your message..."
              />
              
              <div className="text-xs text-gray-400 text-right">
                {editText.length}/500
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editText.trim()}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Options Mode
            <div className="py-2">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm">Edit</span>
              </button>
              
              <div className="border-t border-gray-600"></div>
              
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatMessages;