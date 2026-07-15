const ProfileStats = ({ profile }) => {
  const followers = Array.isArray(profile.followers)
    ? profile.followers.length
    : profile.followers || 0;

  const following = Array.isArray(profile.following)
    ? profile.following.length
    : profile.following || 0;

  const posts = profile.posts || 0;

  return (
    <div className="profile-stats">
      <div>
        <h3>{followers}</h3>
        <p>Followers</p>
      </div>

      <div>
        <h3>{following}</h3>
        <p>Following</p>
      </div>

      <div>
        <h3>{posts}</h3>
        <p>Posts</p>
      </div>
    </div>
  );
};

export default ProfileStats;