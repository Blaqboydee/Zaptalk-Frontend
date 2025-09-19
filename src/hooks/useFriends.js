import { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useFriends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user : {id}} = useContext(AuthContext);

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/friends/${id}/friends`);
      // console.log(res.data);
      setFriends(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError(err.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Add friend
  const addFriend = useCallback(
    async (friendId) => {
      try {
        const res = await axios.post(`${apiUrl}/friends/add-friend/${friendId}`, {
          id,
        });
        // refresh friends list
        fetchFriends();
        return res.data;
      } catch (err) {
        console.error("Add friend failed:", err);
        setError(err.response?.data?.message || "Could not add friend");
      }
    },
    [id, fetchFriends]
  );

  // Remove friend
  const removeFriend = useCallback(
    async (friendId) => {
      console.log(friendId);
      
      try {
        const res = await axios.delete(`${apiUrl}/friends/remove-friend/${friendId}`, {
          data: { id },
        });
        // refresh friends list
        fetchFriends();
        return res.data;
      } catch (err) {
        console.error("Remove friend failed:", err);
        setError(err.response?.data?.message || "Could not remove friend");
      }
    },
    [id, fetchFriends]
  );

  // Fetch on mount
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    loading,
    error,
    addFriend,
    removeFriend,
    refetch: fetchFriends,
  };
}
