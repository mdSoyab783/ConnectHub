import { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { FaPhoneAlt, FaVideo, FaEllipsisV } from "react-icons/fa";

const ChatHeader = ({ conversation }) => {
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();

  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (typingUser) => {
      setTypingUser(typingUser);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [socket]);

  if (!conversation) {
    return (
      <div className="chat-header empty">
        <h3>Select a conversation</h3>
      </div>
    );
  }

  const currentUserId = user.id || user._id;

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== currentUserId
  );

  const isOnline = onlineUsers.includes(otherUser?._id);

  return (
    <div className="chat-header">
      <div className="chat-user">
        <div className="chat-avatar">
          <Avatar
            src={otherUser?.profileImage}
            alt={otherUser?.username}
            size={50}
          />

          {isOnline && <span className="chat-online-dot"></span>}
        </div>

        <div>
          <h3>{otherUser?.fullName}</h3>

          <p>
            {typingUser?._id === otherUser?._id
              ? "✍️ Typing..."
              : isOnline
              ? "🟢 Online"
              : "⚪ Offline"}
          </p>
        </div>
      </div>

      <div className="chat-actions">
        <button>
          <FaPhoneAlt />
        </button>

        <button>
          <FaVideo />
        </button>

        <button>
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;