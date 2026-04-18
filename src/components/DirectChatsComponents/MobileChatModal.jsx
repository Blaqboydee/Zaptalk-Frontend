import React, { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import { useFriends } from "../../hooks/useFriends.js";
import MoodAura from "../MoodAura/MoodAura";

const MobileChatModal = ({
  isOpen,
  onClose,
  selectedChatId,
  otherUser,
  messages,
  user,
  isLoadingMessages,
  messagesEndRef,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isMobile = true,
  replyingTo,
  onReply,
  onCancelReply,
}) => {
  const { friends } = useFriends();
  const liveFriend = friends.find((f) => f._id === otherUser?._id);
  const isOnline = liveFriend?.status?.state === "online";
  const containerRef = useRef(null);

  // Direct DOM manipulation — no React state, no re-render lag.
  // Syncs container position + size to the visual viewport.
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const html = document.documentElement;
    const body = document.body;

    // Lock page scroll
    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';

    const vv = window.visualViewport;

    const sync = () => {
      if (vv) {
        container.style.top = vv.offsetTop + 'px';
        container.style.height = vv.height + 'px';
      } else {
        container.style.top = '0px';
        container.style.height = window.innerHeight + 'px';
      }
    };

    sync();

    if (vv) {
      vv.addEventListener('resize', sync);
      vv.addEventListener('scroll', sync);
    }
    window.addEventListener('resize', sync);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', sync);
        vv.removeEventListener('scroll', sync);
      }
      window.removeEventListener('resize', sync);
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
    };
  }, [isOpen]);

  // Early return if modal should not be displayed
  if (!isOpen || !selectedChatId || !otherUser) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      />
      
      {/* Modal Content — top + height set by direct DOM mutation to match visualViewport */}
      <div 
        ref={containerRef}
        className="flex flex-col"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100dvh',
          zIndex: 51,
          backgroundColor: '#0F0F1A',
          overflow: 'hidden',
          overscrollBehavior: 'none',
        }}
      >
        {/* Header - always stays at top */}
        <div 
          className="flex items-center justify-between px-4 shrink-0"
          style={{ 
            borderBottom: '1px solid #2D2640',
            backgroundColor: '#1A1625',
            minHeight: 70,
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
            paddingBottom: 8,
            zIndex: 10,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: '#252032' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
              aria-label="Close chat"
            >
              <X size={20} className="text-white" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                {otherUser?.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  otherUser?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>

              {/* Online Status Indicator */}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
                  isOnline ? "animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: isOnline ? '#10B981' : '#71717A',
                  border: '2px solid #1A1625'
                }}
                aria-label={`User is ${isOnline ? 'online' : 'offline'}`}
              />
            </div>

            {/* User Info */}
            <div>
              <h2 className="font-bold text-white text-lg">
                {otherUser.name || "Chat"}
              </h2>
              <p 
                className="text-xs"
                style={{ 
                  color: isOnline ? '#22D3EE' : '#71717A'
                }}
              >
                {isOnline ? 'online' : 'offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <MoodAura messages={messages}>
          <ChatMessages
            messages={messages}
            user={user}
            otherUser={otherUser}
            isLoadingMessages={isLoadingMessages}
            messagesEndRef={messagesEndRef}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            onReply={onReply}
            isMobile={isMobile}
            selectedChatId={selectedChatId}
          />
        </MoodAura>

        {/* Message Input */}
        <div className="shrink-0" style={{ borderTop: '1px solid #2D2640' }}>
          <MessageInput 
            onSendMessage={onSendMessage}
            selectedChatId={selectedChatId}
            user={user}
            otherUser={otherUser}
            replyingTo={replyingTo}
            onCancelReply={onCancelReply}
          />
        </div>
      </div>
    </>
  );
};

export default MobileChatModal;