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

  // ---------------- NEW MESSAGE ----------------
  useEffect(() => {
    const handler = (msg) => {
      console.log("NEW MESSAGE:", msg);
    };

    socket.on("new-message", handler);

    return () => socket.off("new-message", handler);
  }, []);

  // ---------------- ONLINE USERS ----------------
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers((users || []).map(String));
    };

    socket.on("online-users", handleOnlineUsers);

    return () => socket.off("online-users", handleOnlineUsers);
  }, []);

  // ---------------- SOCKET JOIN ----------------
  useEffect(() => {
    if (!currentUser?.id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const join = () => {
      socket.emit("join", currentUser.id);
      socket.emit("request-online-users");
    };

    socket.on("connect", join);
    join();

    return () => socket.off("connect", join);
  }, [currentUser?.id]);

  // ---------------- CHAT ROOM JOIN ----------------
  useEffect(() => {
    const chatId = selectedChat?.id;
    if (!chatId) return;

    socket.emit("join-chat", chatId);

    return () => {
      socket.emit("leave-chat", chatId);
    };
  }, [selectedChat?.id]);

  return (
    <div
      className="
        h-dvh
        flex
        flex-col
        md:flex-row
        bg-linear-to-br from-slate-950 via-slate-900 to-slate-800
      "
    >
      {/* LEFT SIDE (SIDEBAR) */}
      <div
        className={`
          h-full
          md:w-80
          w-full
          border-r
          ${selectedChat ? "hidden md:block" : "block"}
        `}
      >
        <Sidebar
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* RIGHT SIDE (CHAT WINDOW) */}
      <div
        className={`
          flex-1
          flex
          flex-col
          h-full
          ${!selectedChat ? "hidden md:flex" : "flex"}
        `}
      >
        {/* TOP BAR */}
        <div className="flex justify-between items-center p-3 border-b bg-black/20 backdrop-blur">
          {/* BACK BUTTON (mobile only) */}
          <button
            onClick={() => setSelectedChat(null)}
            className="md:hidden px-3 py-1 bg-muted rounded text-sm"
          >
            Back
          </button>

          <LogoutButton />
        </div>

        {/* CHAT WINDOW */}
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