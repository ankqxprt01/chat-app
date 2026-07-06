import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { GET_USERS } from "../../graphql/queries/userQueries";
import { GET_CHATS } from "../../graphql/queries/chatQueries";
import { CREATE_CHAT } from "../../graphql/mutations/chatMutations";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function Sidebar({ selectedChat, setSelectedChat, onlineUsers }) {
  const { data, loading } = useQuery(GET_CHATS);
  const chats = data?.chats || [];

  const { data: usersData } = useQuery(GET_USERS);

  const [createChat] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
  });

  const [showUsers, setShowUsers] = useState(false);
  const [search, setSearch] = useState("");

  const currentUser = useSelector((state) => state.auth.user);

  const filteredUsers =
    usersData?.users?.filter(
      (user) =>
        user.id !== currentUser?.id &&
        user.username?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  // 🔙 GLOBAL BACK HANDLER
  const handleBack = () => {
    if (selectedChat) {
      setSelectedChat(null); // back from chat screen
      return;
    }

    if (showUsers) {
      setShowUsers(false); // back from users → chats
      return;
    }
  };

  const handleUserClick = async (receiverId) => {
    try {
      const existingChat = data?.chats?.find((chat) =>
        chat.participants?.some(
          (p) => String(p.id) === String(receiverId)
        )
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        setShowUsers(false);
        return;
      }

      const { data: chatData } = await createChat({
        variables: { receiverId },
      });

      if (chatData?.createChat) {
        setSelectedChat(chatData.createChat);
        setShowUsers(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(Number(createdAt) || createdAt);
    if (isNaN(date)) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedChats = useMemo(() => {
    const getTime = (value) => {
      if (!value) return 0;
      const num = Number(value);
      if (!isNaN(num)) return num;
      return Date.parse(value) || 0;
    };

    return [...chats].sort(
      (a, b) =>
        getTime(b.lastMessage?.createdAt) -
        getTime(a.lastMessage?.createdAt)
    );
  }, [chats]);

  if (loading) {
    return (
      <div className="w-full sm:w-80 h-[100dvh] flex items-center justify-center border-r">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`
        w-full sm:w-80 
        h-[100dvh] 
        border-r 
        flex flex-col 
        bg-background
        ${selectedChat ? "hidden sm:flex" : "flex"}
      `}
    >
      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {selectedChat
              ? "Chat"
              : showUsers
              ? "Users"
              : "Chats"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {showUsers
              ? `${filteredUsers.length} users`
              : `${sortedChats.length} chats`}
          </p>
        </div>

        <div className="flex gap-2">
          {/* BACK BUTTON */}
          {(selectedChat || showUsers) && (
            <button
              onClick={handleBack}
              className="px-3 py-1 text-sm bg-muted rounded"
            >
              Back
            </button>
          )}

          {/* NEW CHAT BUTTON */}
          {!selectedChat && (
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="px-3 py-1 text-sm bg-primary text-white rounded"
            >
              {showUsers ? "Chats" : "New"}
            </button>
          )}
        </div>
      </div>

      {/* USERS */}
      {showUsers && !selectedChat ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 border-b">
            <input
              className="w-full border px-3 py-2 text-sm rounded"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredUsers.map((user) => {
            const isOnline = onlineUsers?.includes(user.id);

            return (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="p-4 border-b flex gap-3 items-center hover:bg-muted cursor-pointer"
              >
                <Avatar>
                  <AvatarFallback>
                    {user.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CHATS */
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedChats.map((chat) => {
            const otherUser = chat.participants?.find(
              (p) => p.id !== currentUser?.id
            );

            const isOnline = onlineUsers?.includes(otherUser?.id);

            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b flex items-center gap-3 cursor-pointer hover:bg-muted ${
                  selectedChat?.id === chat.id
                    ? "bg-muted border-l-4 border-primary"
                    : ""
                }`}
              >
                <Avatar>
                  <AvatarFallback>
                    {otherUser?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-semibold truncate">
                      {otherUser?.username}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.lastMessage?.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage?.content || "No messages yet"}
                  </p>
                </div>

                {isOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;