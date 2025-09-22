import { useState, useRef, useEffect } from "react";
import { useSocket } from "./useSocket";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useChatInitialization = (
  user,
  chats,
  addChat,
  setSelectedChatId,
  setOtherUser,
  setMessages,
  isMobile,
  setIsOffcanvasOpen
) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const initChatRef = useRef(false);
  const {socket} = useSocket();

  // ✅ simple cache: keeps messages in memory per chatId
  const messagesCacheRef = useRef({});

  const initChat = async (friend) => {
    initChatRef.current = true;
    setIsInitializing(true);

    try {
      const existingChat = chats.find(
        (chat) =>
          chat.isDirect &&
          chat.users.some((u) => u._id === user.id) &&
          chat.users.some((u) => u._id === friend._id)
      );

      if (existingChat) {
        setSelectedChatId(existingChat._id);
        setOtherUser({ _id: friend._id, name: friend.name });

        //  don’t fetch again if we already have it
        if (messagesCacheRef.current[existingChat._id]) {
          setMessages(messagesCacheRef.current[existingChat._id]);
        } else {
          const res = await fetch(`${apiUrl}/messages?chatId=${existingChat._id}`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data || []);
            messagesCacheRef.current[existingChat._id] = data || [];
          } else {
            setMessages([]);
          }
        }

        if (isMobile) setIsOffcanvasOpen(true);
        return;
      }

      // create chat if not existing
      const chatRes = await fetch(`${apiUrl}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: [user.id, friend._id],
          isDirect: true,
        }),
      });

      if (!chatRes.ok) {
        const errData = await chatRes.json();
        console.error("Backend error:", errData);
        return;
      }

      const chatData = await chatRes.json();
      setSelectedChatId(chatData._id);
      addChat(chatData);
      setOtherUser({ _id: friend._id, name: friend.name });

      const messagesRes = await fetch(`${apiUrl}/messages?chatId=${chatData._id}`);
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData || []);
        messagesCacheRef.current[chatData._id] = messagesData || [];
      } else {
        setMessages(chatData.messages || []);
        messagesCacheRef.current[chatData._id] = chatData.messages || [];
      }

      if (isMobile) setIsOffcanvasOpen(true);
    } catch (err) {
      console.error("Error initializing chat:", err);
    } finally {
      setIsInitializing(false);
      initChatRef.current = false;
    }
  };

  // keep cache + UI in sync with socket messages
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg) => {
      const { chatId } = msg;

      // update cache
      messagesCacheRef.current[chatId] = [
        ...(messagesCacheRef.current[chatId] || []),
        msg,
      ];

      // if user is currently viewing this chat, update UI too
      setMessages((prev) =>
        chatId === Object.keys(messagesCacheRef.current).find((id) => id === chatId)
          ? [...prev, msg]
          : prev
      );
    };

    socket.on("message", handleIncomingMessage);
    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, [socket, setMessages]);

  // helper: call this when YOU send a message
  const addLocalMessage = (chatId, msg) => {
    console.log(chatId, msg);
    
    messagesCacheRef.current[chatId] = [
      ...(messagesCacheRef.current[chatId] || []),
      msg,
    ];
    setMessages(messagesCacheRef.current[chatId]);
  };

  return { initChat, isInitializing, messagesCacheRef, addLocalMessage };
};
