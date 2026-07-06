import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import socket from "../socket/socket";

function Layout() {
  const client = useApolloClient();

  useEffect(() => {
    const handleNewMessage = (message) => {
      client.cache.modify({
        fields: {
          chats(existingChats = [], { readField }) {
            return existingChats.map((chatRef) => {
              const id = readField("id", chatRef);

              if (id !== message.chatId) return chatRef;

              return {
                ...chatRef,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  createdAt: message.createdAt,
                  sender: message.sender,
                },
              };
            });
          },
        },
      });
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [client]);

  return <Outlet />;
}

export default Layout;