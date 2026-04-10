// hooks/useFriends.js
import { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useGlobalSocket } from "../context/SocketContext.jsx";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useFriends() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const { id, name } = user || {};
  
  // Get everything from Socket context for real-time updates
  const {
    friends,
    friendRequests,
    sentRequests,
    setFriends,
    setFriendRequests,
    setSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    cancelFriendRequest
  } = useGlobalSocket();

  // Fetch friends from API and sync with context
  const fetchFriends = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/friends/${id}/friends`);
      setFriends(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError(err.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [id, setFriends]);

  // Fetch incoming friend requests from API and sync with context
  const fetchFriendRequests = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/friendRequests/${id}`);
      setFriendRequests(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch friend requests:", err);
      setError(err.response?.data?.message || "Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  }, [id, setFriendRequests]);

  // Fetch sent friend requests from API and sync with context
  const fetchSentRequests = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/friendRequests/${id}/sent`);
      setSentRequests(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch sent requests:", err);
      setError(err.response?.data?.message || "Failed to load sent requests");
    } finally {
      setLoading(false);
    }
  }, [id, setSentRequests]);

  // Wrapper for sendFriendRequest to handle loading
  const addFriend = useCallback(
    async (friendId=friendId._id, senderName = name) => {
      try {
        setLoading(true);
        const result = await sendFriendRequest(friendId, senderName);
        return result;
      } catch (err) {
        setError(err.response?.data?.message || "Could not add friend");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sendFriendRequest, name]
  );

  // Wrapper for removeFriend to handle loading
  const handleRemoveFriend = useCallback(
    async (friendId) => {
      try {
        setLoading(true);
        const result = await removeFriend(friendId, name);
        return result;
      } catch (err) {
        setError(err.response?.data?.message || "Could not remove friend");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeFriend, name]
  );

  // Fetch all data on mount
  useEffect(() => {
    if (id) {
      fetchFriends();
      fetchFriendRequests();
      fetchSentRequests();
    }
  }, [fetchFriends, fetchFriendRequests, fetchSentRequests]);

  // Refresh all friend-related data
  const refetchAll = useCallback(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchSentRequests();
  }, [fetchFriends, fetchFriendRequests, fetchSentRequests]);

  return {
    // State from Socket context (real-time)
    friends,
    friendRequests,
    sentRequests,
    loading,
    error,
    
    // Friend management functions from Socket context
    addFriend,
    removeFriend: handleRemoveFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    
    // Fetch methods for manual refresh
    fetchFriends,
    fetchFriendRequests,
    fetchSentRequests,
    
    // Utilities
    refetch: fetchFriends, // Keep backward compatibility
    refetchAll, // New method to refresh all data
    
    // Deprecated setters (kept for backward compatibility but use context ones)
    setRequests: setFriendRequests,
    setSentRequests,
  };
}