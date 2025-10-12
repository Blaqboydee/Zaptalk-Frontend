import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

// import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState("");


  const token = localStorage.getItem("token");
  // const navigate = useNavigate();
  // const navigate = useNavigate()
  //Enhanced login function that returns userId for socket emission
  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);

    // Extract userId for socket operations
    const userId = decodedUser?.id || decodedUser?.userId || decodedUser?._id;

    // Return userId so components can use it immediately
    return { userId, user: decodedUser };
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Helper function to get userId from current user
  const getUserId = () => {
    return user?.id || user?.userId || user?._id || null;
  };

  // Helper function to check if token is expired
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
        // Check if token is expired before using it
        if (isTokenExpired(token)) {
          // console.log("Token expired, removing...");
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

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log(response.data.user);

        setProfile(response.data.user);
        setEditForm({
          name: response.data.user.name,
          email: response.data.user.email,
          bioStatus: response.data.user.bioStatus,
        });
        setAvatarPreview(response.data.user.avatar);
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/login");
      }
    };
    if (token) fetchProfile();
    // else navigate("/login");
  }, [token]);

  // 🔥 Enhanced context value with new utilities
  const contextValue = {
    user,
    login,
    logout,
    loading,
    getUserId, // Helper to get current user's ID
    userId: getUserId(), // Direct access to current user's ID
    isAuthenticated: !!user, // Boolean for authentication status
    setProfile,
    profile,
    editForm,
    setAvatarPreview,
    setEditForm,
    avatarPreview,
    token
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Add this hook
export const useAuth = () => useContext(AuthContext);
