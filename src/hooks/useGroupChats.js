import { useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useGroupChats = (userId) => {
  const [groupChats, setGroupChats] = useState([]);
  const [error, setError] = useState(null);

  const fetchGroupChats = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiUrl}/chats/group?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch group chats");
      }
      const data = await response.json();
      setGroupChats(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching group chats:", error);
      setError("Failed to load groups. Please try again.");
    }
  };

  const createGroup = async (groupName, selectedUserIds, currentUserId) => {
    try {
      const payload = {
        name: groupName.trim(),
        userIds: [currentUserId, ...selectedUserIds],
        isDirect: false
      };

      const response = await fetch(`${apiUrl}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const groupData = await response.json();
      setError(null);
      await fetchGroupChats();
      return groupData;
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group. Please try again.");
      throw err;
    }
  };

  const leaveGroup = async (groupId, userId) => {
    try {
      const response = await fetch(`${apiUrl}/chats/${groupId}/leave`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error("Failed to leave group");
      }

      await fetchGroupChats();
      setError(null);
      return true;
    } catch (err) {
      console.error("Error leaving group:", err);
      setError("Failed to leave group. Please try again.");
      throw err;
    }
  };
    const updateChatWithMessage = (message) => {
    setGroupChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === message.chatId
          ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
          : chat
      )
    );
  };

  useEffect(() => {
    fetchGroupChats();
  }, [userId]);

  return {
    groupChats,
    error,
    setError,
    createGroup,
    leaveGroup,
    updateChatWithMessage,
    refetchChats: fetchGroupChats
  };
};