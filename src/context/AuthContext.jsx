import { createContext, useState, useEffect } from "react";
import { initSocket } from "../lib/socket";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectSocket = (token) => {
    const s = initSocket(token);
    s.connect();
    setSocket(s);
    return s;
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);

    if (socket) socket.disconnect();
    connectSocket(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        connectSocket(token);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, socket }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
