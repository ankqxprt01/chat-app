import { useQuery, useApolloClient } from "@apollo/client/react";
import { GET_MESSAGES } from "../../graphql/queries/messageQueries";
import MessageInput from "./MessageInput";
import { useEffect, useState, useRef, useCallback } from "react";
import socket from "../socket/socket";
import { useSelector } from "react-redux";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { gql } from "@apollo/client";

function ChatWindow({ chatId, selectedChat, onlineUsers }) {
  const client = useApolloClient();

  const notificationSound = useRef(
    new Audio("/sounds/notify.mp3")
  );

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // =========================
  // AUDIO UNLOCK (IMPORTANT)
  // =========================
  useEffect(() => {
    const unlockAudio = () => {
      notificationSound.current
        .play()
        .then(() => {
          notificationSound.current.pause();
          notificationSound.current.currentTime = 0;
        })
        .catch(() => {});

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);

  // =========================
  // CACHE UPDATE
  // =========================
  const updateChatLastMessage = useCallback(
    (message) => {
      client.cache.writeFragment({
        id: client.cache.identify({
          __typename: "Chat",
          id: message.chatId,
        }),
        fragment: gql`
          fragment ChatUpdate on Chat {
            last
            lastMessage {
              id
              content
              createdAt
              sender {
                id
                username
              }
            }
          }
        `,
        data: {
          last: message.createdAt,
          lastMessage: {
            __typename: "Message",
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            sender: message.sender,
          },
        },
      });
    },
    [client]
  );

  // =========================
  // QUERY
  // =========================
  const { data, loading, error } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
  });

  const otherUser =
    selectedChat?.participants?.find(
      (p) => p.id !== currentUser?.id
    );

  const isTypingUserOnline =
    onlineUsers?.includes(otherUser?.id);

  // =========================
  // LOAD MESSAGES
  // =========================
  useEffect(() => {
    if (data?.messages) {
      setMessages([...data.messages]);
    }
  }, [data, chatId]);

  // =========================
  // JOIN CHAT
  // =========================
  useEffect(() => {
    if (chatId) {
      socket.emit("join-chat", chatId);
    }
  }, [chatId]);

  // =========================
  // TYPING
  // =========================
  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop-typing", () => setIsTyping(false));

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, []);

  // =========================
  // REAL-TIME MESSAGES
  // =========================
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (message) => {
      const normalizedMessage = {
        ...message,
        id: message.id || message._id,
        sender: {
          ...message.sender,
          id:
            message.sender?.id ||
            message.sender?._id,
        },
      };

      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.id === normalizedMessage.id
        );
        if (exists) return prev;
        return [...prev, normalizedMessage];
      });

      updateChatLastMessage(normalizedMessage);

      const senderId =
        message.sender?.id || message.sender?._id;

      const isMe =
        String(senderId) === String(currentUser?.id);

      // =========================
      // SOUND (FIXED)
      // =========================
      if (!isMe) {
        notificationSound.current
          .play()
          .catch(() => {});
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [chatId, updateChatLastMessage, currentUser?.id]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // TIME FORMAT
  // =========================
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

  // =========================
  // UI STATES
  // =========================
  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-bold">
            Welcome
          </h2>
          <p className="text-muted-foreground mt-2">
            Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error.message}</h2>;

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex flex-col h-full p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(0, 0, 0, 0.80),
            rgba(0, 0, 0, 0.80)
          ),
          url('/images/abstract.jpg')
        `,
      }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
          {otherUser?.username?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            {otherUser?.username}
          </h2>

          <p className="text-sm text-muted-foreground">
            {isTyping
              ? "Typing..."
              : isTypingUserOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <ScrollArea className="h-[70vh] pr-4">
        {messages.map((msg) => {
          const senderId =
            msg.sender?.id || msg.sender?._id;

          const isMe =
            String(senderId) ===
            String(currentUser?.id);

          return (
            <div
              key={msg.id || msg._id}
              className={`flex mb-3 ${
                isMe
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] w-fit px-3 py-2 shadow-md ${
                  isMe
                    ? "bg-green-600 text-white ml-auto rounded-2xl rounded-br-sm"
                    : "bg-slate-900 text-white rounded-2xl rounded-bl-sm"
                }`}
              >
                <p className="text-xs font-semibold opacity-70 mb-1">
                  {isMe
                    ? "You"
                    : msg.sender?.username}
                </p>

                <p className="text-sm leading-snug">
                  {msg.content}
                </p>

                <p className="text-[10px] mt-1 opacity-60 text-right">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </ScrollArea>

      {/* TYPING */}
      {isTyping && (
        <Badge
          variant="secondary"
          className="mt-2 w-fit"
        >
          Typing...
        </Badge>
      )}

      <MessageInput chatId={chatId} />
    </div>
  );
}

export default ChatWindow;