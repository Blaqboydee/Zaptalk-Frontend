import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { SocketProvider } from "./context/SocketContext";
import { FriendsProvider } from "./context/FriendsContext.jsx";
import { ToastProvider } from "./context/ToastContainer.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { MessageProvider } from "./context/MessageContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <UsersProvider>
          <SocketProvider>
            {/* <MessageProvider> */}
            <FriendsProvider>
              {googleClientId ? (
                <GoogleOAuthProvider clientId={googleClientId}>
                  <App />
                </GoogleOAuthProvider>
              ) : (
                <App />
              )}
            </FriendsProvider>
            {/* </MessageProvider> */}
          </SocketProvider>
        </UsersProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
