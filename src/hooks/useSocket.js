import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(apiUrl);

export const useSocket = (selectedChatId, onMessageReceived) => {
const [messageData, setMessageData] = useState(null)





  useEffect(() => {
    // if (!selectedChatId) return;
    
    socket.emit("join_chat", selectedChatId);
    
   const handleMessage = (msg) => {
  console.log("Frontend received:", msg); 
  if (msg.chatId !== selectedChatId) return;
  onMessageReceived(msg);
  setMessageData(msg);
};


    socket.on("receive_message", handleMessage);
    socket.on("joined_chat", () => {});

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("joined_chat");
    };
  }, [selectedChatId, onMessageReceived]);

  const sendMessage = (messageData) => {
    // console.log("message being sent", messageData);
    
    socket.emit("send_message", messageData);
  
    
    
  };

  return { sendMessage, socket, messageData};
};