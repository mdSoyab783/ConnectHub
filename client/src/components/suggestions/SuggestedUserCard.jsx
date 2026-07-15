import { Link } from "react-router-dom";
import { useState } from "react";

import Avatar from "../common/Avatar";
import userService from "../../services/userService";
import { useSocket } from "../../context/SocketContext";
const SuggestedUserCard = ({ user, onFollow }) => {
  const [loading, setLoading] = useState(false);
const { onlineUsers } = useSocket();

const isOnline = onlineUsers.includes(user._id);
  const handleFollow = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await userService.followUser(user._id);

      if (onFollow) {
        onFollow(user._id);
      }

    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="suggested-user-card">

      <Link
        to={`/users/${user._id}`}
        className="suggested-user-info"
      >
        <div className="avatar-wrapper">
  <Avatar
    src={user.profileImage}
    alt={user.username}
    size={45}
  />

  {isOnline && (
    <span className="online-indicator small"></span>
  )}
</div>

        <div>
          <h4>{user.fullName}</h4>
          <p>@{user.username}</p>
        </div>
      </Link>

      <button
        className="follow-btn-small"
        onClick={handleFollow}
        disabled={loading}
      >
        {loading ? "..." : "Follow"}
      </button>

    </div>
  );
};

export default SuggestedUserCard;