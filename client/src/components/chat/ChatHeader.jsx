import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";

const ChatHeader = ({ conversation }) => {
  const { user } = useAuth();

  if (!conversation) {
    return (
      <div className="chat-header">
        Select a conversation
      </div>
    );
  }

  const currentUserId = user.id || user._id;

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== currentUserId
  );

  return (
    <div className="chat-header">
      <Avatar
        src={otherUser?.profileImage}
        alt={otherUser?.username}
        size={45}
      />

      <div>
        <h3>{otherUser?.fullName}</h3>
        <p>@{otherUser?.username}</p>
      </div>
    </div>
  );
};

export default ChatHeader;