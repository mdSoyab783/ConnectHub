import Avatar from "../common/Avatar";
import FollowButton from "./FollowButton";

import { getImageUrl } from "../../utils/image";
import profileService from "../../services/profileService";
import { useSocket } from "../../context/SocketContext";
import {createConversation} from "../../services/conversationService";
import { useNavigate } from "react-router-dom";
const ProfileHeader = ({
  profile,
  setProfile,
  reloadProfile,
  openEditModal,
  isOwnProfile = true,
}) => {
const { onlineUsers } = useSocket();

const profileId = profile._id || profile.id;

const isOnline = onlineUsers.includes(profileId);
const navigate = useNavigate();
  const handleProfileUpload = async (e) => {

    if (!isOwnProfile) return;

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {

      await profileService.uploadProfileImage(formData);

      reloadProfile();

    } catch (error) {

      console.log(error);

    }

  };

  const handleCoverUpload = async (e) => {

    if (!isOwnProfile) return;

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {

      await profileService.uploadCoverImage(formData);

      reloadProfile();

    } catch (error) {

      console.log(error);

    }

  };
  const handleMessage = async () => {
  try {
    const response = await createConversation(profile._id);

    navigate(
      `/chat/${response.conversation._id}`
    );

  } catch (error) {
    console.log(error);
  }
};

  return (

    <div className="profile-header">

      <div className="cover-container">

        {profile.coverImage ? (

          <img
            src={getImageUrl(profile.coverImage)}
            className="cover-image"
            alt="Cover"
          />

        ) : (

          <div className="cover-placeholder"></div>

        )}

        {isOwnProfile && (

          <label className="cover-upload">

            📷 Change Cover

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
            />

          </label>

        )}

      </div>

      <div className="profile-info">

        {isOwnProfile ? (

          <label className="avatar-upload">

            <div className="profile-avatar-wrapper">
  <Avatar
    src={profile.profileImage}
    alt={profile.username}
    size={130}
  />

  {isOnline && (
    <span className="online-indicator large"></span>
  )}
</div>

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleProfileUpload}
            />

          </label>

        ) : (

          <Avatar
            src={profile.profileImage}
            alt={profile.username}
            size={130}
          />

        )}

        <h2>{profile.fullName}</h2>

        <h4>@{profile.username}</h4>

        {isOwnProfile ? (

          <button
            className="edit-profile-btn"
            onClick={openEditModal}
          >
            ✏️ Edit Profile
          </button>

        ) : (

          <div className="profile-actions">
    <FollowButton
        profile={profile}
        setProfile={setProfile}
    />

    <button
        className="message-btn"
        onClick={handleMessage}
    >
        💬 Message
    </button>
</div>

        )}

      </div>

    </div>

  );

};

export default ProfileHeader;