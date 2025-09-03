// src/lib/socket.js
import { io } from "socket.io-client";

/**
 * Create a socket instance. Call this AFTER login or when you have a token.
 * Use s.connect() to start the connection and s.disconnect() to stop it.
 */
export function initSocket(token) {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  return io(SOCKET_URL, {
    auth: { token },        // sent to server's io.use() for JWT auth
    autoConnect: false,     // we control when to connect
    transports: ["websocket"]
  });
}
