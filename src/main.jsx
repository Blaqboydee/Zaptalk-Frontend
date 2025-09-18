import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { SocketProvider } from "./context/SocketContext";
// import { MessageProvider } from "./context/MessageContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UsersProvider>
        <SocketProvider>
          {/* <MessageProvider> */}
            <App />
          {/* </MessageProvider> */}
        </SocketProvider>
      </UsersProvider>
    </AuthProvider>
  </StrictMode>
);

const loadingScreen = document.getElementById("loading-screen");
if (loadingScreen) {
  loadingScreen.classList.add("fade-out");
  setTimeout(() => loadingScreen.remove(), 300);
}