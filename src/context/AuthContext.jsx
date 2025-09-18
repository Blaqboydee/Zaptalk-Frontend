import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate()
  // 🔥 Enhanced login function that returns userId for socket emission
  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
    
    // 🔥 Extract userId for socket operations
    const userId = decodedUser?.id || decodedUser?.userId || decodedUser?._id;
    
    // Return userId so components can use it immediately
    return { userId, user: decodedUser };
  };

  const logout = () => {
    localStorage.removeItem("token");
    // navigate("/login");
    setUser(null);
  };

  // 🔥 Helper function to get userId from current user
  const getUserId = () => {
    return user?.id || user?.userId || user?._id || null;
  };

  // 🔥 Helper function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // 🔥 Check if token is expired before using it
        if (isTokenExpired(token)) {
          console.log("Token expired, removing...");
          localStorage.removeItem("token");
          setUser(null);
        } else {
          const decodedUser = jwtDecode(token);
          setUser(decodedUser);
          // console.log("Decoded user:", decodedUser);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // 🔥 Enhanced context value with new utilities
  const contextValue = {
    user,
    login,
    logout,
    loading,
    getUserId, // Helper to get current user's ID
    userId: getUserId(), // Direct access to current user's ID
    isAuthenticated: !!user, // Boolean for authentication status
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Add this hook
export const useAuth = () => useContext(AuthContext);