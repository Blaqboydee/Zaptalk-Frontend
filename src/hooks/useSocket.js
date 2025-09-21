// hooks/useSocket.js
import { useEffect, useState } from "react";
import { useGlobalSocket } from "../context/SocketContext";

export const useSocket = (selectedChatId, onMessageReceived) => {
  const { socket, sendMessage } = useGlobalSocket();
  const [messageData, setMessageData] = useState(null);

  useEffect(() => {
    if (!socket || !selectedChatId) return;

    socket.emit("join_chat", selectedChatId);

    const handleMessage = (msg) => {
      console.log("Frontend received:", msg);
      if (msg.chatId !== selectedChatId) return;

      onMessageReceived?.(msg);
      setMessageData(msg);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [socket, selectedChatId, onMessageReceived]);

  return { sendMessage, socket, messageData };
};
