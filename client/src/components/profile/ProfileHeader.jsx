import Avatar from "../common/Avatar";
import FollowButton from "./FollowButton";

import { getImageUrl } from "../../utils/image";
import profileService from "../../services/profileService";
import { useSocket } from "../../context/SocketContext";
import { createConversation } from "../../services/conversationService";
import { useNavigate } from "react-router-dom";

import "./ProfileHeader.css";

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

  // =========================================
  // PROFILE IMAGE UPLOAD
  // =========================================

  const handleProfileUpload = async (e) => {
    if (!isOwnProfile) return;

    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("profileImage", file);

    try {
      await profileService.uploadProfileImage(formData);

      reloadProfile();
    } catch (error) {
      console.log("Profile image upload failed:", error);
    }
  };

  // =========================================
  // COVER IMAGE UPLOAD
  // =========================================

  const handleCoverUpload = async (e) => {
    if (!isOwnProfile) return;

    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("coverImage", file);

    try {
      await profileService.uploadCoverImage(formData);

      reloadProfile();
    } catch (error) {
      console.log("Cover image upload failed:", error);
    }
  };

  // =========================================
  // MESSAGE USER
  // =========================================

  const handleMessage = async () => {
    try {
      const response = await createConversation(profile._id);

      navigate(
        `/chat/${response.conversation._id}`
      );
    } catch (error) {
      console.log("Message conversation error:", error);
    }
  };

  return (
    <div className="profile-header">

      {/* =====================================
          COVER IMAGE
      ===================================== */}

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


      {/* =====================================
          PROFILE INFORMATION
      ===================================== */}

      <div className="profile-info">

        {/* ===================================
            LEFT PROFILE IMAGE
        =================================== */}

        <div className="profile-avatar-area">

          {isOwnProfile ? (

            <label className="avatar-upload">

              <div className="profile-avatar-wrapper">

                <Avatar
                  src={profile.profileImage}
                  alt={profile.username}
                  size={130}
                />

                {/* ONLINE DOT */}

                {isOnline && (
                  <span
                    className="online-indicator large"
                    aria-label="Online"
                  ></span>
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

            <div className="profile-avatar-wrapper">

              <Avatar
                src={profile.profileImage}
                alt={profile.username}
                size={130}
              />

              {/* ONLINE DOT */}

              {isOnline && (
                <span
                  className="online-indicator large"
                  aria-label="Online"
                ></span>
              )}

            </div>

          )}

        </div>


        {/* ===================================
            CENTER PROFILE CONTENT
        =================================== */}

        <div className="profile-center-content">

          <h2>
            {profile.fullName}
          </h2>

          <h4>
            @{profile.username}
          </h4>


          {/* =================================
              OWN PROFILE
          ================================= */}

          {isOwnProfile ? (

            <button
              type="button"
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
                type="button"
                className="message-btn"
                onClick={handleMessage}
              >
                💬 Message
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default ProfileHeader;