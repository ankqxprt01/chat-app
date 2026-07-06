import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";

import { SEND_MESSAGE } from "../../graphql/mutations/messageMutations";
import { GET_CHATS } from "../../graphql/queries/chatQueries";

import socket from "../socket/socket";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SendHorizontal } from "lucide-react";

function MessageInput({ chatId }) {
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
  });

  const [content, setContent] = useState("");

  // ✅ FIX: prevents multiple timers (IMPORTANT FOR MOBILE SMOOTHNESS)
  const typingTimeoutRef = useRef(null);

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      await sendMessage({
        variables: {
          chatId,
          content,
        },
      });

      setContent("");

      socket.emit("stop-typing", chatId);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setContent(value);

    // typing event (same as yours)
    socket.emit("typing", chatId);

    // ✅ FIX: clear previous timeout before creating new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", chatId);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // ✅ important for mobile keyboard stability
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 text-white">
      <Input
        type="text"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1"
      />

      <Button onClick={handleSend}>
        <SendHorizontal />
      </Button>
    </div>
  );
}

export default MessageInput;