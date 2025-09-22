import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Plus,
  MessageCircle,
  Search,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import { useUsers } from "../context/UsersContext";

// Import custom hooks
import { useSocket } from "../hooks/useSocket";
import { useChats } from "../hooks/useChats";
import { useMessages } from "../hooks/useMessages";
import { useFriends } from "../hooks/useFriends.js";
import { useChatInitialization } from "../hooks/useChatInitialization";
import { useResponsive } from "../hooks/useResponsive";
import { useSound } from "../hooks/useSound";
import { useGlobalSocket } from "../context/SocketContext";

// Import components
import ChatListItem from "../components/ChatListItems";
import ChatMessages from "../components/ChatMessages";
import FriendsList from "../components/FriendsList";
import MessageInput from "../components/MessageInput";
import MobileChatModal from "../components/MobileChatModal";

export default function ChatsPage() {
  const { user, allMessages } = useOutletContext();
  const navigate = useNavigate();
  const { isChatOpen, setIsChatOpen, newMessage, registerChatUpdateCallback } = useGlobalSocket();
  const { users, loading } = useUsers();


  // State
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // Custom hooks
  const { isMobile } = useResponsive();
  const { chats, addChat, handleSearch, searchTerm, filteredChats, updateChatOnMessage } = useChats(user?.id);
  const {
    messages,
    isLoadingMessages,
    messagesEndRef,
    addMessage,
    setMessages,
  } = useMessages(selectedChatId);
  const { friends } = useFriends();

  // Register the chat update callback with the socket context
  useEffect(() => {
    registerChatUpdateCallback(updateChatOnMessage);
  }, [registerChatUpdateCallback, updateChatOnMessage]);

  const chatToUpdate = chats.find(
    (theChat) => theChat._id === newMessage?.chatId
  );

  const handleMessageReceived = useCallback((message) => {
    console.log("socket received:", message);
    setMessages((prev) => [...prev, message]);
  }, [setMessages]);

  const { sendMessage: socketSendMessage, messageData } = useSocket(
    selectedChatId,
    handleMessageReceived
  );

  useEffect(() => {
    if (messageData) {
      console.log("Latest message outside the hook:", messageData);
      
    }
  }, [messageData]);

  useSound(messageData);

const {
  initChat,
  addLocalMessage
} = useChatInitialization(
  user,
  chats,
  addChat,
  setSelectedChatId,
  setOtherUser,
  setMessages,
  isMobile,
  setIsOffcanvasOpen
);


  // Handlers
const sendMessage = useCallback(
  (messageContent) => {
    if (!messageContent.trim() || !selectedChatId) return;

    // send to server
    socketSendMessage({
      content: messageContent,
      senderId: user.id,
      chatId: selectedChatId,
    });

    // update local cache/UI instantly
    addLocalMessage(selectedChatId, {
      content: messageContent,
      senderId: user.id,
      chatId: selectedChatId,
      _id: Date.now().toString(), // temp id until server sends real one
      createdAt: new Date().toISOString(),
    });
  },
  [socketSendMessage, selectedChatId, user.id, addLocalMessage]
);


  const openChat = useCallback(
    (chat) => {
      setIsChatOpen(true);
      const secondUser = chat.users?.find((u) => u._id !== user.id);
      if (!secondUser) return;

      setOtherUser(secondUser);
      setSelectedChatId(chat._id);

      if (isMobile) setIsOffcanvasOpen(true);
    },
    [user.id, isMobile, setIsChatOpen]
  );

  const closeOffcanvas = useCallback(() => {
    setIsChatOpen(false);
    setIsOffcanvasOpen(false);

    if (isMobile) {
      setSelectedChatId(null);
      setOtherUser(null);
      setMessages([]);
    }
  }, [isMobile, setMessages, setIsChatOpen]);

  return (
    <div className="">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex-1 flex flex-col">
          {/* <FriendsList initChat={initChat} /> */}

          <main className="flex-column p-2 overflow-y-auto sm:px-6 lg:px-8">
            <div className="relative mb-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-gray-700 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            {chats.length > 0 ? (
              <div className="space-y-1 h-[50vh] overflow-auto">
                {filteredChats.map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    chats={chats}
                    user={user}
                    messageData={messageData}
                    allMessages={allMessages}
                    chatToUpdate={chatToUpdate}
                    openChat={openChat}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="mb-8 relative">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-400 to-orange-600">
                    <svg
                      className="h-12 w-12 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse bg-orange-400"></div>
                  <div
                    className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full animate-pulse bg-orange-500"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <h2 className="text-md font-bold mb-3 text-white">
                  No chats yet
                </h2>
                <p className="text-md mb-8 max-w-md text-gray-400">
                  Start your first conversation by connecting with other users
                  on ZapTalk!
                </p>
                <button
                  onClick={() => navigate("/users")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold text-md hover:from-orange-600 hover:to-orange-700"
                >
                  Find Users
                </button>
              </div>
            )}
          </main>

          {/* Mobile Chat Modal - Now as a separate component */}
          <MobileChatModal
            isOpen={isOffcanvasOpen}
            onClose={closeOffcanvas}
            selectedChatId={selectedChatId}
            otherUser={otherUser}
            messages={messages}
            user={user}
            isLoadingMessages={isLoadingMessages}
            messagesEndRef={messagesEndRef}
            onSendMessage={sendMessage}
            isMobile={isMobile}
          />
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex w-full h-full">
          {/* Left Sidebar - Chat List */}
          <div className="w-96 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Chats</h1>
                <button
                  onClick={() => navigate("/users")}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-105 flex items-center justify-center shadow-lg"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="px-6 py-4 border-b border-gray-700">
              <FriendsList initChat={initChat} />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredChats.length > 0 ? (
                <div className="p-4 space-y-2">
                  {filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat._id}
                      chat={chat}
                      chats={chats}
                      user={user}
                      messageData={messageData}
                      allMessages={allMessages}
                      chatToUpdate={chatToUpdate}
                      openChat={openChat}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-400 to-orange-600">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full animate-pulse bg-orange-400"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    No chats yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start your first conversation!
                  </p>
                  <button
                    onClick={() => navigate("/users")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium hover:from-orange-600 hover:to-orange-700"
                  >
                    Find Users ⚡
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col w-[60%]">
            {selectedChatId && otherUser ? (
              <>
                {/* Chat Header */}
                <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
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

                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${otherUser?.status?.state === "online" ? "bg-green-500" : "bg-gray-400"} border-2 border-gray-800 rounded-full`}></div>
                    </div>
                    <div className="">
                      <h2 className="font-semibold text-white">
                        {otherUser.name || "Chat"}
                      </h2>
                      <p className={`text-xs ${otherUser?.status?.state === "online" ? "text-green-400" : "text-gray-400"}`}>
                        {otherUser?.status?.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center">
                      <Video className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center">
                      <MoreVertical className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="">
                  <ChatMessages
                    messages={messages}
                    user={user}
                    otherUser={otherUser}
                    isLoadingMessages={isLoadingMessages}
                    messagesEndRef={messagesEndRef}
                  />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-700 bg-gray-800">
                  <MessageInput onSendMessage={sendMessage} />
                </div>
              </>
            ) : (
              /* Welcome Screen */
              <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-center p-8">
                <div className="mb-8 relative">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 animate-pulse">
                    <MessageCircle className="h-16 w-16 text-white" />
                  </div>
                  <div
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-400 animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <div
                    className="absolute -bottom-2 -left-3 w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                  <div
                    className="absolute top-8 -left-8 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse"
                    style={{ animationDelay: "1000ms" }}
                  ></div>
                </div>

                <p className="text-xl mb-8 max-w-md text-gray-300 leading-relaxed">
                  Select a conversation from the sidebar to start chatting, or
                  create a new one!
                </p>

                <div className="flex flex-col space-y-4 items-center">
                  <button
                    onClick={() => navigate("/users")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-1"
                  >
                    Start New Chat 🚀
                  </button>

                  <div className="flex items-center space-x-6 text-gray-400 text-sm mt-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "500ms" }}
                      ></div>
                      <span>Real-time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                        style={{ animationDelay: "1000ms" }}
                      ></div>
                      <span>Lightning Fast</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}