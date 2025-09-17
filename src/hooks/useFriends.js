import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalSocket } from "../context/SocketContext";


export const useFriends = () => {
  const {socket} = useGlobalSocket();
  const location = useLocation();

  const [allNewFriends, setAllNewFriends] = useState(() => {
    const saved = localStorage.getItem("friends");
    if (!saved) return [];

    const friends = JSON.parse(saved);
    const unique = Array.from(
      new Map(
        friends.map((f) => [f.otherUserId || f.otherUserName?.toLowerCase(), f])
      ).values()
    );
    localStorage.setItem("friends", JSON.stringify(unique));
    return unique;
  });

  // Deduplicate on mount
  useEffect(() => {
    const saved = localStorage.getItem("friends");
    if (saved) {
      const friends = JSON.parse(saved);
      const unique = Array.from(
        new Map(
          friends.map((f) => [f.otherUserId || f.otherUserName?.toLowerCase(), f])
        ).values()
      );
      if (unique.length !== friends.length) {
        localStorage.setItem("friends", JSON.stringify(unique));
        setAllNewFriends(unique);
      }
    }
  }, []);

   // Add new friend via navigation state
  useEffect(() => {
    const newFriend = location.state;
    if (newFriend?.otherUserId) {
      setAllNewFriends((prev) => {
        const exists = prev.some(
          (f) =>
            f.otherUserId === newFriend.otherUserId ||
            (f.otherUserName &&
              newFriend.otherUserName &&
              f.otherUserName.toLowerCase() ===
                newFriend.otherUserName.toLowerCase())
        );
        if (exists) return prev;

        const updated = [...prev, newFriend];
        localStorage.setItem("friends", JSON.stringify(updated));
        return updated;
      });
    }
  }, [location.state]);

  // 🔥 FIXED: Handle consistent status structure from server
  useEffect(() => {
    if (!socket) return;
    
    const handleStatusUpdate = ({ userId, status }) => {
      console.log("Status update received:", { userId, status }); // Debug log
      
      setAllNewFriends((prev) => {
        const updated = prev.map((friend) =>
          friend.otherUserId === userId
            ? {
                ...friend,
                status, //  Use the complete status object from server
              }
            : friend
        );
        localStorage.setItem("friends", JSON.stringify(updated));
        return updated;
      });
    };

    socket.on("user-status-updated", handleStatusUpdate);

    return () => {
      socket.off("user-status-updated", handleStatusUpdate);
    };
  }, [socket]);

  return { allNewFriends, setAllNewFriends };
};