import { useEffect, useState } from "react";

import profileService from "../../services/profileService";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import AboutCard from "../../components/profile/AboutCard";
import UserPosts from "../../components/profile/UserPosts";
import EditProfileModal from "../../components/profile/EditProfileModal";

import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadProfile = async () => {
    try {
      const response = await profileService.getMyProfile();
      setProfile(response.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) return <h2>Loading...</h2>;

  return (
    <div className="profile-page">

      <ProfileHeader
        profile={profile}
        reloadProfile={loadProfile}
        openEditModal={() => setShowModal(true)}
      />

      <ProfileStats profile={profile} />

      <AboutCard profile={profile} />

      <UserPosts userId={profile._id} />

      {showModal && (
        <EditProfileModal
          profile={profile}
          reloadProfile={loadProfile}
          closeModal={() => setShowModal(false)}
        />
      )}

    </div>
  );
};

export default Profile;