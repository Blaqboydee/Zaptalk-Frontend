import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatTime } from "../../utils/formatTime";
import { Edit2, Trash2, Check, X } from "lucide-react";

const ChatMessages = ({
  messages,
  selectedChatId,
  user,
  otherUser,
  isLoadingMessages,
  messagesEndRef,
  onEditMessage,
  onDeleteMessage,
  isMobile,
}) => {
  // State for message options modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Refs
  const modalRef = useRef(null);
  const editInputRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedMessage(null);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [longPressTimer]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleLongPressStart = useCallback((message, event) => {
    // Only allow actions on own messages
    const isOwnMessage = message.senderId?._id === user?.id || message.senderId === user?.id;
    if (!isOwnMessage || !user) return;

    clearLongPressTimer();

    const rect = event.currentTarget?.getBoundingClientRect();
    if (!rect) return;

    const timer = setTimeout(() => {
      // Position modal to avoid going off-screen
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const viewportWidth = window.innerWidth;
      const modalWidth = 150;

      let xPos = rect.right + 10;
      if (xPos + modalWidth > viewportWidth) {
        xPos = rect.left - modalWidth + 10;
      }

      setModalPosition({
        x: Math.max(10, xPos),
        y: rect.top + scrollTop,
      });

      setSelectedMessage(message);
      setEditText(message.content || "");
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
      await onEditMessage(selectedMessage._id, editText.trim());
      setIsEditing(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  }, [editText, selectedMessage, onEditMessage]);

  const handleCancelEdit = useCallback(() => {
    setEditText(selectedMessage?.content || "");
    setIsEditing(false);
  }, [selectedMessage]);

  const handleDelete = useCallback(async () => {
    if (!selectedMessage) return;

    try {
      await onDeleteMessage(selectedMessage._id);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }, [selectedMessage, onDeleteMessage]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === "Escape") {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // Early return if user is not available
  if (!user) {
    return (
      <div className="text-center py-8" style={{ color: '#A1A1AA' }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Messages Container */}
      <div
        className={`overflow-y-auto p-4 space-y-6 scrollbar-hidden ${
          isMobile ? "h-[calc(95vh-120px)]" : "h-[calc(78vh-120px)]"
        }`}
        style={{ backgroundColor: '#0F0F1A' }}
      >
        {isLoadingMessages ? (
          <div className="text-center py-8" style={{ color: '#A1A1AA' }}>
            Loading messages...
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#A1A1AA' }}>
            No messages yet
          </div>
        ) : (
          messages.map((message) => {
            if (!message?._id) return null;

            const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;

            return (
              <div
                key={message._id}
                className={`flex gap-3 animate-fade-in ${isOwnMessage ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex-1 w-[85%] ${isOwnMessage ? "text-right" : ""}`}>
                  <div className={`relative inline-block max-w-[75%] min-w-[120px] ${isOwnMessage ? "ml-auto" : "mr-auto"}`}>
                    {/* Message Bubble */}
                    <div
                      onMouseDown={(e) => handleLongPressStart(message, e)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onTouchStart={(e) => handleLongPressStart(message, e)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                      className={`
                        px-5 py-3 relative select-none cursor-pointer
                        shadow-lg transform transition-all duration-200 hover:scale-[1.01]
                        ${message.pending ? "opacity-70" : ""}
                      `}
                      style={{
                        backgroundColor: isOwnMessage ? '#8B5CF6' : '#252032',
                        borderRadius: isOwnMessage ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        border: `1px solid ${isOwnMessage ? '#7C3AED' : '#2D2640'}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = isOwnMessage 
                          ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
                          : '0 4px 12px rgba(0, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      {/* Subtle highlight effect */}
                      <div
                        className="absolute top-2 left-3 w-6 h-6 rounded-full blur-sm pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                        }}
                      />

                      {/* Message content */}
                      <p 
                        className="text-white text-[13px] leading-relaxed whitespace-pre-wrap mb-1 relative z-10"
                        style={{ color: isOwnMessage ? '#FFFFFF' : '#FFFFFF' }}
                      >
                        {message.content || ""}
                        {message.edited && (
                          <span 
                            className="text-[10px] opacity-60 ml-2"
                            style={{ color: isOwnMessage ? '#E9D5FF' : '#A1A1AA' }}
                          >
                            (edited)
                          </span>
                        )}
                        {message.pending && (
                          <span 
                            className="text-[10px] opacity-60 ml-2"
                            style={{ color: isOwnMessage ? '#E9D5FF' : '#A1A1AA' }}
                          >
                            (sending...)
                          </span>
                        )}
                      </p>

                      {/* Timestamp */}
                      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mt-1`}>
                        <span 
                          className="text-[10px] opacity-70 relative z-10"
                          style={{ color: isOwnMessage ? '#E9D5FF' : '#A1A1AA' }}
                        >
                          {message.createdAt ? formatTime(message.createdAt) : ""}
                        </span>
                      </div>
                    </div>
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
          className="fixed z-50 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
            transform: "translateY(-50%)",
            minWidth: isEditing ? "300px" : "150px",
            maxWidth: "90vw",
            backgroundColor: '#1A1625',
            border: '1px solid #2D2640',
          }}
        >
          {isEditing ? (
            <EditMessageForm
              editText={editText}
              setEditText={setEditText}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              onKeyDown={handleKeyDown}
              editInputRef={editInputRef}
            />
          ) : (
            <MessageOptions
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </>
  );
};

// Extracted Edit Form Component
const EditMessageForm = ({
  editText,
  setEditText,
  onSave,
  onCancel,
  onKeyDown,
  editInputRef
}) => (
  <div className="p-4 space-y-3">
    <div className="flex items-center space-x-2 mb-3">
      <Edit2 size={16} style={{ color: '#8B5CF6' }} />
      <span className="text-white text-sm font-medium">Edit Message</span>
    </div>

    <textarea
      ref={editInputRef}
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      onKeyDown={onKeyDown}
      className="w-full p-3 text-white rounded-lg focus:outline-none resize-none text-sm transition-all duration-200"
      style={{
        backgroundColor: '#252032',
        border: '1px solid #2D2640'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#8B5CF6';
        e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#2D2640';
        e.target.style.boxShadow = 'none';
      }}
      rows="3"
      maxLength="500"
      placeholder="Enter your message..."
    />

    <div className="text-xs text-right" style={{ color: '#71717A' }}>
      {editText.length}/500
    </div>

    <div className="flex space-x-2">
      <button
        onClick={onSave}
        disabled={!editText.trim()}
        className="flex-1 px-3 py-2 text-white rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
        style={{
          backgroundColor: !editText.trim() ? '#6D28D9' : '#8B5CF6',
          opacity: !editText.trim() ? 0.7 : 1,
          cursor: !editText.trim() ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => !editText.trim() ? null : e.currentTarget.style.backgroundColor = '#7C3AED'}
        onMouseLeave={(e) => !editText.trim() ? null : e.currentTarget.style.backgroundColor = '#8B5CF6'}
      >
        <Check size={14} />
        Save
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-3 py-2 text-white rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2"
        style={{ backgroundColor: '#252032' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
      >
        <X size={14} />
        Cancel
      </button>
    </div>
  </div>
);

// Extracted Message Options Component
const MessageOptions = ({ onEdit, onDelete }) => (
  <div className="py-2">
    <button
      onClick={onEdit}
      className="w-full px-4 py-3 text-left text-white transition-all duration-200 flex items-center space-x-3 hover:scale-[1.02]"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252032'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Edit2 size={16} style={{ color: '#8B5CF6' }} />
      <span className="text-sm">Edit</span>
    </button>

    <div style={{ borderTop: '1px solid #2D2640' }} />

    <button
      onClick={onDelete}
      className="w-full px-4 py-3 text-left transition-all duration-200 flex items-center space-x-3 hover:scale-[1.02]"
      style={{ 
        backgroundColor: 'transparent',
        color: '#EF4444'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Trash2 size={16} />
      <span className="text-sm">Delete</span>
    </button>
  </div>
);

export default ChatMessages;