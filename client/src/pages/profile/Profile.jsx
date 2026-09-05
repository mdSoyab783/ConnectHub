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

  // =========================================
  // LOAD PROFILE
  // =========================================

  const loadProfile = async () => {
    try {
      const response = await profileService.getMyProfile();

      setProfile(response.user);
    } catch (error) {
      console.log("Profile loading error:", error);
    }
  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadProfile();
  }, []);


  // =========================================
  // LOADING
  // =========================================

  if (!profile) {
    return (
      <div className="profile-loading">

        <div className="profile-loading-spinner"></div>

        <p>Loading profile...</p>

      </div>
    );
  }


  // =========================================
  // PROFILE PAGE
  // =========================================

  return (
    <div className="profile-page">

      {/* =====================================
          PROFILE HEADER
      ===================================== */}

      <section className="profile-section profile-header-section">

        <ProfileHeader
          profile={profile}
          reloadProfile={loadProfile}
          openEditModal={() => setShowModal(true)}
        />

      </section>


      {/* =====================================
          PROFILE STATS
      ===================================== */}

      <section className="profile-section">

        <ProfileStats
          profile={profile}
        />

      </section>


      {/* =====================================
          ABOUT
      ===================================== */}

      <section className="profile-section">

        <AboutCard
          profile={profile}
        />

      </section>


      {/* =====================================
          USER POSTS
      ===================================== */}

      <section className="profile-section profile-posts-section">

        <UserPosts
          userId={profile._id}
        />

      </section>


      {/* =====================================
          EDIT PROFILE MODAL
      ===================================== */}

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