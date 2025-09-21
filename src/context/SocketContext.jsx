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

  // Create socket when user logs in
  useEffect(() => {
    if (!user) return;

    const newSocket = io(apiUrl, { withCredentials: true });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Emit "user-online" on connect
  useEffect(() => {
    if (!socket || !user) return;

    const handleConnect = () => {
      socket.emit("user-online", user.id);
    };

    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, user]);

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

      // console.log("Global message received:", msg);
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

    // When you receive a friend request
    const handleFriendRequestReceived = (data) => {
      // console.log(" Friend request received:", data);
      toast.friendRequest(data.from.name);
      setFriendRequests((prev) => [...prev, data]);
    };

    // When your request is accepted
    const handleFriendRequestAccepted = (data) => {
      // console.log("Friend request accepted:", data);
      toast.friendAccepted(`${data.friend.username || data.friend.name}`);
      
      // Add to friends list
      setFriends((prev) => [...prev, data.friend]);
      
      // Remove from sent requests
      setSentRequests((prev) => prev.filter((r) => r.to._id !== data.friend._id));
    };

    // When you are removed as a friend
    const handleFriendRemoved = (data) => {
      // console.log("Friend removed:", data);
      toast.error(`${data.name} removed you as a friend`);
      setFriends((prev) => prev.filter((f) => f._id !== data.friendId));
    };

    // Attach listeners
    socket.on("friend_request_received", handleFriendRequestReceived);
    // socket.on("friend_request_sent", handleFriendRequestSent)
    socket.on("friend_request_accepted", handleFriendRequestAccepted);
    socket.on("friend_removed", handleFriendRemoved);

    return () => {
      socket.off("friend_request_received", handleFriendRequestReceived);
      socket.off("friend_request_accepted", handleFriendRequestAccepted);
      socket.off("friend_removed", handleFriendRemoved);
    };
  }, [socket, user, toast]);

  // Emit message
  const sendMessage = (data) => {
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