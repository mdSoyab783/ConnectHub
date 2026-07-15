import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const ConversationItem = ({
  conversation,
  active,
  onClick,
}) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const currentUserId = user.id || user._id;

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== currentUserId
  );

  const isOnline = onlineUsers.includes(otherUser?._id);

  return (
    <div
      className={`conversation-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        <Avatar
          src={otherUser?.profileImage}
          alt={otherUser?.username}
          size={55}
        />

        {isOnline && (
          <span className="conversation-online"></span>
        )}
      </div>

      <div className="conversation-details">

        <div className="conversation-top">

          <h4>{otherUser?.fullName}</h4>

          {conversation.lastMessage && (
            <span className="conversation-time">
              {new Date(
                conversation.lastMessage.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

        </div>

        <p className="conversation-preview">
          {conversation.lastMessage?.text ||
            "Start chatting..."}
        </p>

      </div>
    </div>
  );
};

export default ConversationItem;