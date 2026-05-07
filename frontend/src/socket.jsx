import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],

  forceNew: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  timeout: 20000,
  autoConnect: true,
});

// =====================
// CONNECT
// =====================
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

// =====================
// DISCONNECT
// =====================
socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

// =====================
// ERROR
// =====================
socket.on("connect_error", (err) => {
  console.log("❌ Socket error:", err.message);
});

export default socket;