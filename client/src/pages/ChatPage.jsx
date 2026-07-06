import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import LogoutButton from "../components/LogoutButton";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../socket/socket";

function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUser = useSelector((state) => state.auth.user);

  // -----------------------------
  // NEW MESSAGE LISTENER
  // -----------------------------
  useEffect(() => {
    const handler = (msg) => {
      console.log("NEW MESSAGE:", msg);
    };

    socket.on("new-message", handler);

    return () => {
      socket.off("new-message", handler);
    };
  }, []);

  // -----------------------------
  // ONLINE USERS LISTENER
  // -----------------------------
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers((users || []).map(String));
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  // -----------------------------
  // JOIN + SYNC (FIXED CORE LOGIC)
  // -----------------------------
  useEffect(() => {
    if (!currentUser?.id) return;

    if (!socket.connected) {
      socket.connect(); // 🔥 CRITICAL FIX
    }

    const join = () => {
      socket.emit("join", currentUser.id);
      socket.emit("request-online-users");
    };

    socket.on("connect", join);

    // if already connected
    join();

    return () => socket.off("connect", join);
  }, [currentUser?.id]);

  // -----------------------------
  // JOIN CHAT ROOM
  // -----------------------------
  useEffect(() => {
    const chatId = selectedChat?.id;
    if (!chatId) return;

    socket.emit("join-chat", chatId);

    return () => {
      socket.emit("leave-chat", chatId);
    };
  }, [selectedChat?.id]);

  console.log("SOCKET ID:", socket.id);
  console.log("CONNECTED:", socket.connected);

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800">
      <Sidebar
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        onlineUsers={onlineUsers}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4 border-b">
          <LogoutButton />
        </div>

        <ChatWindow
          chatId={selectedChat?.id}
          selectedChat={selectedChat}
          onlineUsers={onlineUsers}
        />
      </div>
    </div>
  );
}

export default ChatPage;
