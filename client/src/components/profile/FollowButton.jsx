import { useState } from "react";
import userService from "../../services/userService";

const FollowButton = ({
  profile,
  setProfile,
}) => {

  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {

    if (loading) return;

    const previousState = { ...profile };

    // Optimistic UI
    setProfile((prev) => ({
      ...prev,
      isFollowing: true,
      followers: prev.followers + 1,
    }));

    setLoading(true);

    try {

      const response = await userService.followUser(profile._id);

      setProfile((prev) => ({
        ...prev,
        followers: response.followers,
        isFollowing: response.isFollowing,
      }));

    } catch (error) {

      console.log(error);

      // Rollback
      setProfile(previousState);

    } finally {

      setLoading(false);

    }

  };

  const handleUnfollow = async () => {

    if (loading) return;

    const previousState = { ...profile };

    // Optimistic UI
    setProfile((prev) => ({
      ...prev,
      isFollowing: false,
      followers: Math.max(0, prev.followers - 1),
    }));

    setLoading(true);

    try {

      const response = await userService.unfollowUser(profile._id);

      setProfile((prev) => ({
        ...prev,
        followers: response.followers,
        isFollowing: response.isFollowing,
      }));

    } catch (error) {

      console.log(error);

      // Rollback
      setProfile(previousState);

    } finally {

      setLoading(false);

    }

  };

  if (profile.isFollowing) {
    return (
      <button
        className="following-btn"
        disabled={loading}
        onClick={handleUnfollow}
      >
        {loading ? "Loading..." : "Following"}
      </button>
    );
  }

  return (
    <button
      className="follow-btn"
      disabled={loading}
      onClick={handleFollow}
    >
      {loading ? "Loading..." : "Follow"}
    </button>
  );
};

export default FollowButton;