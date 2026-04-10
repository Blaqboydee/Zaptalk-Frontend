import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ userId, children }) => {
  const [friendsList, setFriendsList] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!userId) return;

    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${apiUrl}/friends/${userId}/friends`);
        setFriendsList(res.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    fetchFriends();
  }, [userId]);

  return (
    <FriendsContext.Provider value={{ friendsList, setFriendsList }}>
      {children}
    </FriendsContext.Provider>
  );
};
