// MessageContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { socket } = useSocket(); // <-- your global socket
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      console.log("Received from backend:", msg); 
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleMessage);

    return () => socket.off("receive_message", handleMessage);
  }, [socket]);

  return (
    <MessageContext.Provider value={{ messages, setMessages }}>
      {children}
    </MessageContext.Provider>
  );
}

export const useMessages = () => useContext(MessageContext);
