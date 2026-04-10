// context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { useToast } from "./ToastContainer";


const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const chatUpdateCallbackRef = useRef(null);
  const { toast } = useToast();
 
  // Friend-related state - centralized here for real-time updates
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Create socket when user logs in and immediately register user-online
  useEffect(() => {
    if (!user) return;

    const newSocket = io(apiUrl);

    // Attach before connect fires so we never miss it
    newSocket.on("connect", () => {
      newSocket.emit("user-online", user.id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Emit "user-online" on reconnect
  useEffect(() => {
    if (!socket || !user) return;

    const handleReconnect = () => {
      socket.emit("user-online", user.id);
    };

    socket.on("reconnect", handleReconnect);
    return () => {
      socket.off("reconnect", handleReconnect);
    };
  }, [socket, user]);

  // Sync friends' online status whenever socket connects or friends list is loaded
  useEffect(() => {
    if (!socket || friends.length === 0) return;

    const friendIds = friends.map((f) => f._id.toString());
    socket.emit("get_friends_online_status", friendIds);

    const handleFriendsOnlineStatus = (statusMap) => {
      setFriends((prev) =>
        prev.map((f) => {
          const isOnline = statusMap[f._id.toString()];
          if (isOnline === undefined) return f;
          return {
            ...f,
            status: { ...f.status, state: isOnline ? "online" : "offline" },
          };
        })
      );
    };

    socket.once("friends_online_status", handleFriendsOnlineStatus);
    return () => {
      socket.off("friends_online_status", handleFriendsOnlineStatus);
    };
  }, [socket, friends.length]);

  // Join user chats after login
  useEffect(() => {
    if (!socket || !user) return;

    const fetchUserChats = async () => {
      try {
        const res = await axios.get(`${apiUrl}/chats/user/${user.id}`);
        const chatIds = res.data.map((chat) => chat._id);
        socket.emit("join_chats", chatIds);
      } catch (err) {
        console.error("Failed to fetch user chats:", err);
      }
    };

    fetchUserChats();
  }, [socket, user]);

  // Handle receiving messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.senderId._id === user?.id) return;

      if (!isChatOpen) {
        // console.log(`New message from ${msg.senderId.name}`);
        toast.success(`New message from ${msg.senderId.name}`);
      }

      console.log("Global message received:", msg);
      setMessages((prev) => [...prev, msg]);
      setNewMessage(msg);
 


      if (chatUpdateCallbackRef.current) {
        chatUpdateCallbackRef.current(msg.chatId, msg);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, isChatOpen, user]);

  // 🔥 Listen for friend events - UNIFIED HANDLING
  useEffect(() => {
    if (!socket || !user) return;

    // When you receive a friend request — guard against duplicates
    const handleFriendRequestReceived = (data) => {
      toast.friendRequest(data.from.name);
      setFriendRequests((prev) => {
        const alreadyExists = prev.some((r) => r.from._id === data.from._id);
        if (alreadyExists) return prev;
        return [...prev, data];
      });
    };

    // When your sent request was accepted
    const handleFriendRequestAccepted = (data) => {
      toast.friendAccepted(`${data.friend.username || data.friend.name}`);
      setFriends((prev) => {
        const alreadyFriend = prev.some((f) => f._id === data.friend._id);
        if (alreadyFriend) return prev;
        return [...prev, data.friend];
      });
      setSentRequests((prev) => prev.filter((r) => r.to._id !== data.friend._id));
    };

    // When your incoming request was accepted (you are the accepter)
    const handleFriendAdded = (data) => {
      setFriends((prev) => {
        const alreadyFriend = prev.some((f) => f._id === data.friend._id);
        if (alreadyFriend) return prev;
        return [...prev, data.friend];
      });
      setFriendRequests((prev) => prev.filter((r) => r.from._id !== data.friend._id));
    };

    // When a sent request was rejected by recipient
    const handleFriendRequestRejected = (data) => {
      setSentRequests((prev) => prev.filter((r) => r.to._id !== data.receiverId));
    };

    // When sender cancels their request to you
    const handleFriendRequestCancelled = (data) => {
      setFriendRequests((prev) => prev.filter((r) => r.from._id !== data.senderId));
    };

    // When you are removed as a friend
    const handleFriendRemoved = (data) => {
      toast.error(`${data.name} removed you as a friend`);
      setFriends((prev) => prev.filter((f) => f._id !== data.friendId));
    };

    // Update online status of friends in real-time
    const handleUserStatusUpdated = ({ userId, status }) => {
      setFriends((prev) =>
        prev.map((f) => (f._id === userId ? { ...f, status } : f))
      );
    };

    socket.on("friend_request_received", handleFriendRequestReceived);
    socket.on("friend_request_accepted", handleFriendRequestAccepted);
    socket.on("friend_added", handleFriendAdded);
    socket.on("friend_request_rejected", handleFriendRequestRejected);
    socket.on("friend_request_cancelled", handleFriendRequestCancelled);
    socket.on("friend_removed", handleFriendRemoved);
    socket.on("user-status-updated", handleUserStatusUpdated);

    return () => {
      socket.off("friend_request_received", handleFriendRequestReceived);
      socket.off("friend_request_accepted", handleFriendRequestAccepted);
      socket.off("friend_added", handleFriendAdded);
      socket.off("friend_request_rejected", handleFriendRequestRejected);
      socket.off("friend_request_cancelled", handleFriendRequestCancelled);
      socket.off("friend_removed", handleFriendRemoved);
      socket.off("user-status-updated", handleUserStatusUpdated);
    };
  }, [socket, user, toast]);

  // Emit message
  const sendMessage = (data) => {
    console.log(data);
    
    if (socket) {
      socket.emit("send_message", data);
    }
  };

  // Allow components to register a callback for chat updates
  const registerChatUpdateCallback = (callback) => {
    chatUpdateCallbackRef.current = callback;
  };

  // Friend management functions - centralized here
  const sendFriendRequest = async (targetUser, senderName) => {
    // console.log(targetUser);
    
    try {
      const res = await axios.post(`${apiUrl}/friendRequests/${targetUser._id}`, {
        userId: user.id,
        senderName: senderName
      });
      
      // Update sent requests immediately
      setSentRequests(prev => [...prev, { to: { _id: targetUser._id, name:targetUser.name, avatar: targetUser.avatar } }]);
      toast.friendRequestSent(targetUser.name);
      return res.data;
    } catch (err) {
      console.error("Send friend request failed:", err);
      toast.error("Failed to send friend request");
      throw err;
    }
  };

  const acceptFriendRequest = async (requesterId, requesterName) => {
    // console.log(requesterId);
    
    try {
      const res = await axios.post(`${apiUrl}/friendRequests/${requesterId}/accept`, {
        userId: user.id,
        requesterName: requesterName
      });

      // console.log(res.data);
      
      
      // Update state immediately
      setFriendRequests(prev => prev.filter(r => r.from._id !== requesterId));
      setFriends(prev => [...prev, res.data.newFriend]);
      
      return res.data;
    } catch (err) {
      console.error("Accept friend request failed:", err);
      toast.error("Could not accept friend request");
      throw err;
    }
  };

  const rejectFriendRequest = async (requesterId, requesterName) => {
    try {
      const res = await axios.post(`${apiUrl}/friendRequests/${requesterId}/reject`, {
        userId: user.id,
        requesterName: requesterName
      });
      
      // Remove from requests immediately
      setFriendRequests(prev => prev.filter(r => r.from._id !== requesterId));
      return res.data;
    } catch (err) {
      console.error("Reject friend request failed:", err);
      toast.error("Could not reject friend request");
      throw err;
    }
  };

  const removeFriend = async (friendId, userName) => {
    try {
      const res = await axios.delete(`${apiUrl}/friends/remove-friend`, {
        data: {
          friendId: friendId,
          userId: user.id,
          userName: userName
        }
      });
      
      // Update friends list immediately
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
      return res.data;
    } catch (err) {
      console.error("Remove friend failed:", err);
      toast.error("Could not remove friend");
      throw err;
    }
  };

  const cancelFriendRequest = async (friendId) => {
    try {
      const res = await axios.post(`${apiUrl}/friendRequests/${friendId}/cancel`, {
        userId: user.id
      });
      
      // Remove from sent requests immediately
      setSentRequests(prev => prev.filter(r => r.to._id !== friendId));
      return res.data;
    } catch (err) {
      console.error("Cancel friend request failed:", err);
      toast.error("Could not cancel friend request");
      throw err;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        // Socket stuff
        socket,
        messages,
        sendMessage,
        isChatOpen,
        setIsChatOpen,
        newMessage,
        registerChatUpdateCallback,
        
        // Friend state
        friendRequests,
        friends,
        sentRequests,
        setFriendRequests,
        setFriends,
        setSentRequests,
        
        // Friend actions
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        cancelFriendRequest
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useGlobalSocket = () => useContext(SocketContext);