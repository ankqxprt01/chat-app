import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   autoConnect: false, // 🔥 important for controlled reconnect
// });

const socket = io("https://chat-app-abma.onrender.com", {
  autoConnect: false, // 🔥 important for controlled reconnect
});

export default socket;