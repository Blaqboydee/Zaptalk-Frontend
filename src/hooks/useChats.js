import { useState, useEffect } from "react";
import { useFriends } from "./useFriends.js";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useChats = (userId) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { friends } = useFriends();
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/chats?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const sortedChats = data.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || a.createdAt || 0;
            const bTime = b.lastMessage?.createdAt || b.createdAt || 0;
            return new Date(bTime) - new Date(aTime);
          });
          setChats(sortedChats);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  // Filter chats to only include those with friends (when no search term)
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Filter chats to only show those that include friends
      const friendFilteredChats = chats?.filter(chat => 
        chat.users?.some(chatUser => 
          friends?.some(friend => friend._id === chatUser._id)
        )
      ) || [];
      
      setFilteredChats(friendFilteredChats);
      return;
    }

    // When there's a search term, first filter by friends, then by search
    const friendFilteredChats = chats?.filter(chat => 
      chat.users?.some(chatUser => 
        friends?.some(friend => friend._id === chatUser._id)
      )
    ) || [];

    const chatsWithOtherUsers = friendFilteredChats
      .map((chat) => ({
        chat,
        otherUser: chat.users.find((u) => u._id !== userId),
      }))
      .filter((item) => item.otherUser);

    const searchFiltered = chatsWithOtherUsers.filter((item) =>
      item.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredChats(searchFiltered.map((item) => item.chat));
  }, [chats, searchTerm, userId, friends]);

  const updateChatOnMessage = (chatId, newMessage) => {
    console.log("Sorting chat to top:", chatId);

    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex(
        (chat) => String(chat._id) === String(chatId)
      );

      if (chatIndex === -1) {
        console.log("Chat not found:", chatId);
        return prevChats;
      }

      if (chatIndex === 0) {
        // Chat is already at the top
        return prevChats;
      }

      // Create new array with the chat moved to the top
      const updatedChats = [...prevChats];
      const [chatToMove] = updatedChats.splice(chatIndex, 1);
      updatedChats.unshift(chatToMove);

      console.log("Chat moved to top successfully");
      return updatedChats;
    });
  };

  const addChat = (newChat) => {
    setChats((prev) => {
      if (prev.some((chat) => String(chat._id) === String(newChat._id)))
        return prev;
      return [newChat, ...prev];
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return {
    chats,
    filteredChats,
    isLoading,
    addChat,
    setChats,
    handleSearch,
    searchTerm,
    updateChatOnMessage,
  };
};