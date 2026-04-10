import { useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "./useSocket";

export function useSound(messageData) {
    const { user } = useAuth();
    // console.log(user);
    
  
  useEffect(() => {
    if (!messageData) return;
    if (user.id === messageData.senderId._id) return

    // console.log("Latest message inside useSound:", messageData);

    const sound = new Audio("/sounds/notification.wav");
    sound.play().catch(() => {});

  }, [messageData]); 
}

