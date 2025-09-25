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
  const {socket, isChatOpen, setIsChatOpen, newMessage, registerChatUpdateCallback } =
    useGlobalSocket();
  const { users, loading } = useUsers();

  // State
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // Custom hooks
  const { isMobile } = useResponsive();
  const {
    chats,
    addChat,
    handleSearch,
    searchTerm,
    filteredChats,
    updateChatOnMessage,
    isLoading,
  } = useChats(user?.id);

  const {
    messages,
    isLoadingMessages,
    messagesEndRef,
    addMessage,
    setMessages,
    editMessage,
    deleteMessage,
  } = useMessages(selectedChatId, user?.id);
  
  const { friends } = useFriends();

  // Socket message handler - FIXED: Now properly adds messages to state
  const handleMessageReceived = useCallback(
    (message) => {
      console.log("Socket received message:", message);
      // Add message to current messages state
      addMessage(message);
    },
    [addMessage]
  );

  // Socket hook
  const { sendMessage: socketSendMessage, messageData } = useSocket(
    selectedChatId,
    handleMessageReceived
  );

  // Register chat update callback
  useEffect(() => {
    registerChatUpdateCallback(updateChatOnMessage);
  }, [registerChatUpdateCallback, updateChatOnMessage]);

  // Sound notification
  useSound(messageData);

  // Chat initialization
  const { initChat } = useChatInitialization(
    user,
    chats,
    addChat,
    setSelectedChatId,
    setOtherUser,
    setMessages,
    isMobile,
    setIsOffcanvasOpen
  );

  // Message sending handler - FIXED: Now properly handles message sending
  const sendMessage = useCallback(
    (messageContent) => {
      if (!messageContent.trim() || !selectedChatId || !user?.id) return;

      const tempMessage = {
        _id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
        content: messageContent,
        senderId: user.id, // Make sure this matches the format the server returns
        chatId: selectedChatId,
        createdAt: new Date().toISOString(),
        pending: true, // Mark as pending
      };

      // Add optimistic message immediately
      addMessage(tempMessage);

      // Send to server via socket
      socketSendMessage({
        content: messageContent,
        senderId: user.id,
        chatId: selectedChatId,
      });
    },
    [socketSendMessage, selectedChatId, user?.id, addMessage]
  );

  const openChat = useCallback(
    (chat) => {
      setIsChatOpen(true);
      const secondUser = chat.users?.find((u) => u._id !== user.id);
      if (!secondUser) return;

       if (socket) {
         console.log('Joining chat room:', chat._id);
      socket.emit("join_chat", chat._id);
    }

      setOtherUser(secondUser);
      setSelectedChatId(chat._id);

      if (isMobile) setIsOffcanvasOpen(true);
    },
    [user.id, isMobile, setIsChatOpen, socket]
  );

  const closeOffcanvas = useCallback(() => {
    setIsChatOpen(false);
    setIsOffcanvasOpen(false);
  }, [setIsChatOpen]);

  // Find chat that needs updating
  const chatToUpdate = chats.find(
    (theChat) => theChat._id === newMessage?.chatId
  );

  return (
    <div className="h-[85vh] bg-slate-900  overflow-hidden">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex-1 flex flex-col h-full">
          <main className="flex-1 p-4 overflow-hidden">
            {/* Search Bar with glassmorphism */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
              />
            </div>

            {/* Chat List Content */}
            {isLoading ? (
              <LoadingState />
            ) : chats.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-auto">
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
              <EmptyChatsState navigate={navigate} />
            )}
          </main>

          {/* Mobile Chat Modal - UNCHANGED */}
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
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            isMobile={isMobile}
          />
        </div>
      ) : (
        /* Desktop Layout with Glassmorphism */
        <div className="flex h-[85vh] bg-gray-900 w-full overflow-hidden">
          {/* Left Sidebar - Chat List */}
          <div className="w-96 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden">
            {/* Header with glassmorphism */}
            <div className="p-6 border-b border-white/10  backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Chats</h1>
                <button
                  onClick={() => navigate("/users")}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-400/80 to-orange-500/80 hover:from-orange-500/90 hover:to-orange-600/90 transition-all duration-200 hover:scale-105 flex items-center justify-center shadow-lg backdrop-blur-md border border-orange-300/30"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Search Bar with glassmorphism */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Friends List with glassmorphism */}
            <div className="px-6 py-4 border-b border-white/10">
              <FriendsList initChat={initChat} />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
                <EmptyChatsState navigate={navigate} />
              )}
            </div>
          </div>

          {/* Right Side - Chat Area with glassmorphism */}
          <div className="flex-1 flex flex-col overflow-hidden ">
            {selectedChatId && otherUser ? (
              <>
                {/* Chat Header with glassmorphism */}
                <ChatHeader otherUser={otherUser} />

                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
                  <ChatMessages
                    messages={messages}
                    selectedChatId={selectedChatId}
                    user={user}
                    otherUser={otherUser}
                    isLoadingMessages={isLoadingMessages}
                    messagesEndRef={messagesEndRef}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                  />
                </div>

                {/* Message Input - FIXED props */}
                <div className="z-50  border-t border-white/10 bg-white/5">
                  <MessageInput 
                    onSendMessage={sendMessage}
                    selectedChatId={selectedChatId}
                    user={user}
                    otherUser={otherUser}
                  />
                </div>
              </>
            ) : (
              <WelcomeScreen navigate={navigate} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted components with glassmorphism styling
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center text-center py-16">
    <div className="relative mb-8">
      <div className="animate-spin w-16 h-16 border-4 border-orange-400/60 border-t-transparent rounded-full backdrop-blur-md"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200/20 rounded-full"></div>
    </div>
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
      <div
        className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
    <h2 className="text-lg font-semibold text-white mb-2">Loading chats...</h2>
    <p className="text-white/70 text-sm">
      Please wait while we fetch your conversations
    </p>
  </div>
);

const EmptyChatsState = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="mb-8 relative">
      <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-orange-400/80 to-orange-600/80 backdrop-blur-md border border-orange-300/30">
        <MessageCircle className="h-12 w-12 text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse bg-orange-300/80 backdrop-blur-sm"></div>
      <div
        className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full animate-pulse bg-orange-400/80 backdrop-blur-sm"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
    <h2 className="text-md font-bold mb-3 text-white">No chats yet</h2>
    <p className="text-md mb-8 max-w-md text-white/70">
      Start your first conversation by connecting with other users on ZapTalk!
    </p>
    <button
      onClick={() => navigate("/users")}
      className="bg-gradient-to-r from-orange-400/80 to-orange-500/80 hover:from-orange-500/90 hover:to-orange-600/90 text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-orange-300/30 transition-all duration-200 hover:scale-105 font-semibold text-md"
    >
      Find Users
    </button>
  </div>
);

const ChatHeader = ({ otherUser }) => (
  <div className="h-16 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden border-2 border-white/20">
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
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
            otherUser?.status?.state === "online"
              ? "bg-green-400"
              : "bg-gray-400"
          } border-2 border-white/30 rounded-full shadow-lg`}
        ></div>
      </div>
      <div className="">
        <h2 className="font-semibold text-white">
          {otherUser.name || "Chat"}
        </h2>
        <p
          className={`text-xs ${
            otherUser?.status?.state === "online"
              ? "text-green-300"
              : "text-white/60"
          }`}
        >
          {otherUser?.status?.state}
        </p>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 flex items-center justify-center backdrop-blur-md border border-white/20">
        <Phone className="w-4 h-4 text-white/80" />
      </button>
      <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 flex items-center justify-center backdrop-blur-md border border-white/20">
        <Video className="w-4 h-4 text-white/80" />
      </button>
      <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 flex items-center justify-center backdrop-blur-md border border-white/20">
        <MoreVertical className="w-4 h-4 text-white/80" />
      </button>
    </div>
  </div>
);

const WelcomeScreen = ({ navigate }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
    <div className="mb-8 relative">
      <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-orange-400/80 to-orange-600/80 backdrop-blur-md border border-orange-300/30 animate-pulse">
        <MessageCircle className="h-16 w-16 text-white" />
      </div>
      <div
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-orange-300/80 to-orange-400/80 animate-bounce backdrop-blur-sm border border-orange-200/30"
        style={{ animationDelay: "200ms" }}
      ></div>
      <div
        className="absolute -bottom-2 -left-3 w-6 h-6 rounded-full bg-gradient-to-r from-orange-400/80 to-orange-500/80 animate-bounce backdrop-blur-sm border border-orange-300/30"
        style={{ animationDelay: "600ms" }}
      ></div>
      <div
        className="absolute top-8 -left-8 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500/80 to-orange-600/80 animate-pulse backdrop-blur-sm border border-orange-400/30"
        style={{ animationDelay: "1000ms" }}
      ></div>
    </div>

    <p className="text-xl mb-8 max-w-md text-white/80 leading-relaxed">
      Select a conversation from the sidebar to start chatting, or create a new one!
    </p>

    <div className="flex flex-col space-y-4 items-center">
      <button
        onClick={() => navigate("/users")}
        className="bg-gradient-to-r from-orange-400/80 to-orange-500/80 hover:from-orange-500/90 hover:to-orange-600/90 text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-orange-300/30 transition-all duration-300 hover:scale-105 font-semibold text-lg transform hover:-translate-y-1"
      >
        Start New Chat
      </button>

      <div className="flex items-center space-x-6 text-white/60 text-sm mt-8">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Secure</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "500ms" }}
          ></div>
          <span>Real-time</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: "1000ms" }}
          ></div>
          <span>Lightning Fast</span>
        </div>
      </div>
    </div>
  </div>
);