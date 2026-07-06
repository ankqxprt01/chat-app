const { Server } = require("socket.io");
const User = require("../models/User");

const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);
socket.on("request-online-users", () => {
  socket.emit("online-users", Array.from(onlineUsers.keys()));
});
  

    // user joins app (IMPORTANT)
 socket.on("join", async (userId) => {
  onlineUsers.set(userId, socket.id);

  await User.findByIdAndUpdate(userId, {
    currentSocketId: socket.id,
  });

  io.emit("online-users", Array.from(onlineUsers.keys()));
});

    // send message
    socket.on("send-message", (message) => {
      const { chatId } = message;

      console.log("MESSAGE RECEIVED ON SERVER:", message);

      io.to(chatId).emit("new-message", message);
    });

    // logout
   socket.on("logout", async (userId) => {
  onlineUsers.delete(userId);

  await User.findByIdAndUpdate(userId, {
    currentSocketId: null,
  });

  io.emit("online-users", Array.from(onlineUsers.keys()));

  socket.disconnect(true);
});
    // join chat room
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);

      console.log("USER JOINED ROOM:", chatId);
      console.log("ROOMS:", socket.rooms);
    });

    // typing
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing");
    });

    socket.on("stop-typing", (chatId) => {
      socket.to(chatId).emit("stop-typing");
    });

    // disconnect cleanup
    socket.on("disconnect", async () => {
  for (const [userId, socketId] of onlineUsers) {
    if (socketId === socket.id) {

      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        currentSocketId: null,
      });

      break;
    }
  }

  io.emit("online-users", Array.from(onlineUsers.keys()));
});
  });

  return { io, onlineUsers };
};

module.exports = initializeSocket;