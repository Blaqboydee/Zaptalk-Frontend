import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext"; // assuming you have this

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // logged-in user
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
const apiUrl = import.meta.env.VITE_API_URL;
 
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${apiUrl}/users`);
        const data = await res.json();

        // Exclude the current logged-in user
        const otherUsers = data.filter((u) => u._id !== user.id);
        setUsers(otherUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  

  return (
    <UsersContext.Provider value={{ users, setUsers, loading }}>
      {children}
    </UsersContext.Provider>
  );
};

// Custom hook for easier usage
export const useUsers = () => useContext(UsersContext);
