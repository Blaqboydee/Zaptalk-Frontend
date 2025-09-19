import { useState, useRef } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useChatInitialization = (user, chats, addChat, setSelectedChatId, setOtherUser, setMessages, isMobile, setIsOffcanvasOpen) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const initChatRef = useRef(false);

  const initChat = async (friend) => {
    console.log(friend);
    
    console.log("initChat started for:", user.id, friend._id);
    initChatRef.current = true;
    setIsInitializing(true);

    try {
      const existingChat = chats.find((chat) =>
        chat.isDirect &&
        chat.users.some((u) => u._id === user.id) &&
        chat.users.some((u) => u._id === friend._id)
      );

      if (existingChat) {
        setSelectedChatId(existingChat._id);
        setOtherUser({ _id: friend._id, name: friend.name });
        const messagesRes = await fetch(`${apiUrl}/messages?chatId=${existingChat._id}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData || []);
        }
        if (isMobile) setIsOffcanvasOpen(true);
        console.log("Using existing chat");
        return;
      }
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
      } else {
        setMessages(chatData.messages || []);
      }

      console.log("initChat finished successfully");
      if (isMobile) setIsOffcanvasOpen(true);
    } catch (err) {
      console.error("Error initializing chat:", err);
    } finally {
      setIsInitializing(false);
      initChatRef.current = false;
    }
  };

  return { initChat, isInitializing };
};