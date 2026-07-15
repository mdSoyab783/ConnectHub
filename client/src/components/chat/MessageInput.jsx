import { useState } from "react";
import { sendMessage } from "../../services/messageService";

const MessageInput = ({
  conversation,
  onMessageSent,
}) => {
  const [text, setText] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;
    if (!conversation) return;

    try {
      const response = await sendMessage(
        conversation._id,
        text
      );

      setText("");

      if (onMessageSent) {
        onMessageSent(response.message);
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      className="message-input"
      onSubmit={handleSend}
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
      />

      <button type="submit">
        Send
      </button>
    </form>
  );
};

export default MessageInput;