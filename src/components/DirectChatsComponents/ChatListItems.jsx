import React, { useState, useEffect } from "react";
import { formatTime } from "../../utils/formatTime.js";
import { useGlobalSocket } from "../../context/SocketContext.jsx";
import { useSocket } from "../../hooks/useSocket.js";
import { useFriends } from "../../hooks/useFriends.js";
import { ChevronRight } from "lucide-react";

const ChatListItem = ({
  chats,
  chat,
  user,
  allMessages,
  openChat,
  messageData,
  chatToUpdate,
}) => {
  const secondUser = chat.users?.find((u) => u._id !== user.id);
  const { friends } = useFriends();
  const [isDotVisible, setIsDotVisible] = useState(true);
  
  const filteredMessages =
    allMessages?.filter((message) => message.chatId === chat._id) || [];
  const lastMessage =
    filteredMessages[filteredMessages.length - 1] || chat.lastMessage;
  const { newMessage, isChatOpen } = useGlobalSocket();

  useEffect(() => {
    if (messageData && messageData.chatId === chat._id) {
      console.log("New message for this chat:", messageData);
    }
  }, [messageData]);

  // Get all messages belonging to this chat
  const messageToChange =
    allMessages?.filter((message) => message.chatId === chat._id) || [];

  // Only add newMessage if it belongs to this chat
  const messageToPrint =
    newMessage && newMessage.chatId === chat._id
      ? [...messageToChange, newMessage]
      : messageToChange;

  const latestMessage = messageToPrint[messageToPrint.length - 1]?.content;

  // Determine what message to display based on sender
  const getDisplayMessage = () => {
    // If messageData exists and belongs to this chat
    if (messageData && messageData.chatId === chat._id) {
      // Check if current user is the sender of messageData
      if (
        messageData.senderId._id === user.id ||
        messageData.sender === user.id
      ) {
        // Current user is sender, show messageData.content
        return messageData.content;
      } else {
        // Current user is receiver, show latestMessage
        return latestMessage;
      }
    }

    // Default fallback
    return latestMessage || lastMessage?.content;
  };

  const displayMessage = getDisplayMessage();

  // Find the chat with the latest message across all chats
  const findLatestMessageChat = () => {
    let latestChatId = null;
    let latestTimestamp = 0;

    chats?.forEach((chatItem) => {
      const chatMessages =
        allMessages?.filter((msg) => msg.chatId === chatItem._id) || [];

      // Include newMessage if it belongs to this chat
      const messagesWithNew =
        newMessage && newMessage.chatId === chatItem._id
          ? [...chatMessages, newMessage]
          : chatMessages;

      if (messagesWithNew.length > 0) {
        const lastMsg = messagesWithNew[messagesWithNew.length - 1];
        const timestamp = new Date(lastMsg.createdAt).getTime();

        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestChatId = chatItem._id;
        }
      }
    });

    return latestChatId;
  };

  const hasLatestMessage = findLatestMessageChat() === chat._id;

  // Show dot when there's a new message for this chat
  useEffect(() => {
    if (hasLatestMessage && newMessage && newMessage.chatId === chat._id) {
      setIsDotVisible(true);
    }
  }, [hasLatestMessage, newMessage, chat._id]);

  // Hide dot when chat is opened
  const handleChatClick = () => {
    setIsDotVisible(false);
    openChat(chat);
  };

  // Toggle dot visibility when dot is clicked
  const handleDotClick = (e) => {
    e.stopPropagation(); // Prevent chat from opening
    setIsDotVisible(!isDotVisible);
  };

  return (
    <div
      onClick={handleChatClick}
      className="cursor-pointer p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
      style={{
        backgroundColor: '#1A1625',
        border: '1px solid #2D2640'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#8B5CF6';
        e.currentTarget.style.transform = 'scale(1.01)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2D2640';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div className="flex items-center space-x-4">
        <div className="relative flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {secondUser?.avatar ? (
              <img
                src={secondUser.avatar}
                alt={secondUser?.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              secondUser?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          {/* Online status indicator */}
          {secondUser?.status?.state === "online" && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full animate-pulse"
              style={{
                backgroundColor: '#10B981',
                border: '2px solid #1A1625'
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h2 
              className="font-semibold text-sm text-white transition-colors duration-200"
              style={{
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#22D3EE'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
            >
              {chat.users?.length === 2
                ? secondUser?.name || "Private Chat"
                : chat.name || "Group Chat"}
            </h2>
            <span 
              className="text-[11px] font-medium"
              style={{ color: '#71717A' }}
            >
              {lastMessage ? formatTime(lastMessage.createdAt) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p 
              className="text-[12px] truncate flex-1 mr-2"
              style={{ color: '#A1A1AA' }}
            >
              {displayMessage?.length > 15
                ? `${displayMessage.slice(0, 15) + `...`}`
                : displayMessage || "No messages yet"}
            </p>
            {hasLatestMessage && isDotVisible && (
              <div
                onClick={handleDotClick}
                className="w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-125 animate-pulse"
                style={{ backgroundColor: '#22D3EE' }}
                title="Mark as read"
              />
            )}
          </div>
        </div>

        <div 
          className="flex-shrink-0 transition-all duration-200 group-hover:translate-x-1"
          style={{ color: '#71717A' }}
        >
          <ChevronRight 
            size={20} 
            className="transition-colors duration-200"
            onMouseEnter={(e) => e.currentTarget.style.color = '#8B5CF6'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#71717A'}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;