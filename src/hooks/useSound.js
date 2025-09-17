import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useSound() {
    const {socket} = useSocket()
  useEffect(() => {
    if (!socket) return;

    const sound = new Audio("/sounds/notification.wav"); 

    const handleNewMessage = () => {
        sound.play().catch(() => {}); 
    };

socket.on("receive_message", handleNewMessage);
return () => socket.off("receive_message", handleNewMessage);

  }, [socket]);
}
