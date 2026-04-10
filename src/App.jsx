import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { initSocket } from "./lib/socket";
import { Toaster } from "sonner";

import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chats from "./pages/Chats"
import UsersList from "./pages/UsersList";
import ChatLayout from "./pages/ChatLayout";
import GroupChats from "./pages/GroupChats";
import Friends from "./pages/Friends";
import Ping from "./components/ping";

// Loading component with mobile-optimized styling
function LoadingScreen() {
  return (
    <div className="zap-page-container flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-spin bg-gradient-to-r from-orange-500 to-orange-600 mx-auto">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 rounded-full animate-pulse bg-orange-500"></div>
          <div
            className="w-3 h-3 rounded-full animate-pulse bg-orange-600"
            style={{ animationDelay: "200ms" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full animate-pulse bg-orange-700"
            style={{ animationDelay: "400ms" }}
          ></div>
        </div>
        <p className="text-gray-400 font-medium text-lg">
          Loading ZapTalk...
        </p>
      </div>
    </div>
  );
}

// App content component to handle location logic
function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const location = useLocation();

  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("ember-splash-shown")
  );
  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("ember-splash-shown", "1");
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (user && !socket) {
      const s = initSocket(user.token); // pass JWT token
      s.connect();
      setSocket(s);

      return () => s.disconnect();
    }
  }, [user, socket]);

  if (loading) {
    return <LoadingScreen />;
  }

  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";
  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="zap-app-container">
      <Toaster position="top-right" />
     
      {!hideNavbar && <Navbar />}
      <div className={!hideNavbar ? "md:pl-[240px] content-safe-bottom" : ""}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />

        <Route
          path="/allchats"
          element={user ? <ChatLayout user={user} /> : <Navigate to="/login" />}
        >
          <Route index element={<Chats />} />
          <Route path="/allchats/directmessages" element={<Chats />} />
          <Route path="/allchats/groups" element={<GroupChats />} />
        </Route>

        <Route
          path="/users"
          element={user ? <UsersList socket={socket} user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/friends"
          element={user ? <Friends socket={socket} user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/ping" element={<Ping/>} />
      </Routes>
      </div>
    </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;