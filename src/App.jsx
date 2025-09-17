import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { initSocket } from "./lib/socket";
import { Toaster } from "sonner";

import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chats from "./pages/Chats"
import UsersList from "./pages/UsersList";
import ChatLayout from "./pages/ChatLayout";
import GroupChats from "./pages/GroupChats";

function App() {
  const { user, loading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && !socket) {
      const s = initSocket(user.token); // pass JWT token
      s.connect();
      setSocket(s);

      return () => s.disconnect();
    }
  }, [user, socket]);

  if (loading) {
    return <p>Loading...</p>; // temporary loader
  }

    const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
    <Toaster position="top-right"/>
     <Router>
     {!hideNavbar &&  <Navbar /> }
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

        <Route index element={<Chats/>}/>

        <Route path="/allchats/directmessages" element={<Chats/>}/>
        <Route path="/allchats/groups" element={<GroupChats/>}/>

        </Route>
      


       
       
           <Route
          path="/users"
          element={user ? <UsersList socket={socket} user={user} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
    </>
   
  );
}

export default App;
