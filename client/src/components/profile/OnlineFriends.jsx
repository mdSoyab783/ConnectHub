import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import userService from "../../services/userService";

const OnlineFriends = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const [following, setFollowing] = useState([]);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      const response = await userService.getFollowing(user.id || user._id);
      setFollowing(response.following || []);
    } catch (error) {
      console.log(error);
    }
  };

  const onlineFriends = following.filter(friend =>
    onlineUsers.includes(friend._id)
  );

  return (
    <div className="online-friends">
      <h3>🟢 Online Friends</h3>

      {onlineFriends.length === 0 ? (
        <p>No friends online.</p>
      ) : (
        onlineFriends.map(friend => (
          <Link
            key={friend._id}
            to={`/users/${friend._id}`}
            className="online-friend"
          >
            <Avatar
              src={friend.profileImage}
              alt={friend.username}
              size={40}
            />

            <div>
              <strong>{friend.fullName}</strong>
              <p>@{friend.username}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default OnlineFriends;