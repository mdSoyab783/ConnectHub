import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import userService from "../../services/userService";
import { getImageUrl } from "../../utils/image";

const OnlineFriends = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOnlineFriends = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const userId = user._id || user.id;

        if (!userId) return;

        const response =
          await userService.getFollowing(userId);

        const following = response.users || response.following || [];

        const currentUserId =
          user._id || user.id;

        const onlineFriends = following.filter(
          (friend) => {
            const friendId =
              friend._id || friend.id;

            return (
              friendId !== currentUserId &&
              onlineUsers.includes(friendId)
            );
          }
        );

        setFriends(onlineFriends);
      } catch (error) {
        console.error(
          "Failed to load online friends:",
          error
        );

        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    loadOnlineFriends();
  }, [user, onlineUsers]);

  if (loading) {
    return (
      <div className="online-friends">
        <p className="online-friends-empty">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="online-friends">

      {friends.length === 0 ? (
        <p className="online-friends-empty">
          No friends online
        </p>
      ) : (
        friends.map((friend) => {
          const friendId =
            friend._id || friend.id;

          return (
            <div
              className="online-friend"
              key={friendId}
            >
              <div className="online-friend-avatar-wrapper">

                <img
                  src={getImageUrl(
                    friend.profileImage
                  )}
                  alt={
                    friend.fullName ||
                    friend.username ||
                    "User"
                  }
                  className="online-friend-avatar"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/default-avatar.png";
                  }}
                />

                <span className="online-dot"></span>

              </div>

              <div className="online-friend-info">

                <strong>
                  {friend.fullName ||
                    friend.username ||
                    "User"}
                </strong>

                {friend.username &&
                  friend.fullName && (
                    <span>
                      @{friend.username}
                    </span>
                  )}

              </div>
            </div>
          );
        })
      )}

    </div>
  );
};

export default OnlineFriends;