import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatTime } from "../utils/formatTime";

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
    return <div className="text-gray-400 text-center">Loading...</div>;
  }

  return (
    <>
      {/* Messages Container */}
      <div
        className={`overflow-y-auto p-4 space-y-6 scrollbar-hidden ${
          isMobile ? "h-[calc(70vh-120px)]" : "h-[calc(78vh-120px)]"
        }`}
      >
        {isLoadingMessages ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet</div>
        ) : (
          messages.map((message) => {
            if (!message?._id) return null;

            const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;

            return (
              <div
                key={message._id}
                className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
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
                        px-5 py-2 relative select-none cursor-pointer
                        ${isOwnMessage
                          ? "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
                          : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"
                        }
                        shadow-xl transform transition-all duration-200 hover:scale-[1.01]
                        ${isOwnMessage ? "hover:shadow-orange-500/25" : "hover:shadow-gray-500/25"}
                        ${message.pending ? "opacity-70" : ""}
                      `}
                      style={{
                        borderRadius: isOwnMessage ? "25px 25px 8px 25px" : "25px 25px 25px 8px",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
                      }}
                    >
                      {/* Highlight effect */}
                      <div
                        className="absolute top-2 left-3 w-6 h-6 bg-white opacity-20 rounded-full blur-sm pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
                        }}
                      />

                      {/* Message content */}
                      <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap mb-1 relative z-10">
                        {message.content || ""}
                        {message.edited && (
                          <span className="text-[10px] opacity-60 ml-2">(edited)</span>
                        )}
                        {message.pending && (
                          <span className="text-[10px] opacity-60 ml-2">(sending...)</span>
                        )}
                      </p>

                      {/* Timestamp */}
                      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mt-2`}>
                        <span className="text-[10px] text-white opacity-70 relative z-10">
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
          className="fixed z-50 bg-gray-800 rounded-xl shadow-2xl border border-gray-600 backdrop-blur-md"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
            transform: "translateY(-50%)",
            minWidth: isEditing ? "300px" : "150px",
            maxWidth: "90vw",
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
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span className="text-white text-sm font-medium">Edit Message</span>
    </div>

    <textarea
      ref={editInputRef}
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      onKeyDown={onKeyDown}
      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none resize-none text-sm"
      rows="3"
      maxLength="500"
      placeholder="Enter your message..."
    />

    <div className="text-xs text-gray-400 text-right">{editText.length}/500</div>

    <div className="flex space-x-2">
      <button
        onClick={onSave}
        disabled={!editText.trim()}
        className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-all duration-200"
      >
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
      className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3"
    >
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span className="text-sm">Edit</span>
    </button>

    <div className="border-t border-gray-600"></div>

    <button
      onClick={onDelete}
      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-sm">Delete</span>
    </button>
  </div>
);

export default ChatMessages