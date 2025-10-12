import React, { useState, useEffect } from "react";
import { formatTime } from "../../utils/formatTime.js";
import { useGlobalSocket } from "../../context/SocketContext.jsx";
import { useSocket } from "../../hooks/useSocket.js";
import { useFriends } from "../../hooks/useFriends.js";

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
  const {friends} = useFriends()
  const [isDotVisible, setIsDotVisible] = useState(true);
  // console.log(allMessages);
  
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
      className="cursor-pointer  bg-gray-900  p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700  group hover:border-orange-500/30 hover:shadow-orange-500/10"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
            {secondUser?.avatar? (
              <img
                src={secondUser.avatar}
                alt={secondUser?.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              secondUser?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-white group-hover:text-orange-300 transition-colors">
              {chat.users?.length === 2
                ? secondUser?.name || "Private Chat"
                : chat.name || "Group Chat"}
            </h2>
            <span className="text-[11px] font-medium text-gray-400">
              {lastMessage ? formatTime(lastMessage.createdAt) : ""}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[12px] truncate flex-1 mr-2 text-gray-400">
              {displayMessage?.length > 15
                ? `${displayMessage.slice(0, 15) + `...`}`
                : displayMessage || "No messages yet"}
            </p>
            {hasLatestMessage && (
              <div
                onClick={handleDotClick}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${
                  isDotVisible ? "bg-orange-500 opacity-100" : ""
                }`}
                title={isDotVisible ? "Mark as read" : "Mark as unread"}
              />
            )}
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-orange-300 transition-colors duration-200">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
