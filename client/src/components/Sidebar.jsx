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

  const handleUserClick = async (receiverId) => {
    try {
      const existingChat = data?.chats?.find((chat) =>
        chat.participants?.some(
          (participant) => String(participant.id) === String(receiverId)
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
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "";

    const date = isNaN(createdAt)
      ? new Date(createdAt)
      : new Date(Number(createdAt));

    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedChats = useMemo(() => {
    const getTime = (value) => {
      if (!value) return 0;

      const num = Number(value);
      if (!Number.isNaN(num)) return num;

      return Date.parse(value) || 0;
    };

    return [...chats].sort((a, b) => {
      const aTime = getTime(a.lastMessage?.createdAt);
      const bTime = getTime(b.lastMessage?.createdAt);
      return bTime - aTime;
    });
  }, [chats]);

  if (loading) {
    return (
      <div className="w-full sm:w-80 h-[100dvh] border-r flex items-center justify-center">
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
        bg-background 
        flex flex-col
        ${selectedChat ? "hidden sm:flex" : "flex"}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {showUsers ? "Users" : "Chats"}
          </h2>

          <p className="text-xs text-muted-foreground">
            {showUsers
              ? `${filteredUsers.length} users`
              : `${sortedChats.length} chats`}
          </p>
        </div>

        <button
          onClick={() => setShowUsers(!showUsers)}
          className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm"
        >
          {showUsers ? "Back" : "New Chat"}
        </button>
      </div>

      {/* USERS VIEW */}
      {showUsers ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          {filteredUsers.map((user) => {
            const isOnline = onlineUsers?.some(
              (id) => String(id) === String(user.id || user._id)
            );

            return (
              <div
                key={user.id || user._id}
                onClick={() => handleUserClick(user.id)}
                className="p-4 border-b cursor-pointer hover:bg-muted transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar>
                      <AvatarFallback>
                        {user.username?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[150px]">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              No users found.
            </div>
          )}
        </div>
      ) : (
        /* CHATS VIEW */
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedChats.length > 0 ? (
            sortedChats.map((chat) => {
              const otherUser = chat.participants?.find(
                (p) => p.id !== currentUser?.id
              );

              const isOnline = onlineUsers?.some(
                (id) => String(id) === String(otherUser?.id)
              );

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`
                    flex items-center gap-3 p-4 border-b cursor-pointer transition
                    ${
                      selectedChat?.id === chat.id
                        ? "bg-muted border-l-4 border-primary"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  <div className="relative shrink-0">
                    <Avatar>
                      <AvatarFallback>
                        {otherUser?.username?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold truncate max-w-[120px]">
                        {otherUser?.username}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {formatTime(chat?.lastMessage?.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      {chat?.lastMessage?.content ?? "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center">
              <h3 className="font-semibold mb-2">No Conversations Yet</h3>
              <p className="text-muted-foreground">
                Click "New Chat" to start chatting with someone.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;