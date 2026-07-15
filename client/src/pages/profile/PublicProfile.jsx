import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import profileService from "../../services/profileService";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import AboutCard from "../../components/profile/AboutCard";
import UserPosts from "../../components/profile/UserPosts";

import { useAuth } from "../../context/AuthContext";

const PublicProfile = () => {

  const { id } = useParams();

  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {

    try {

      const response = await profileService.getUserProfile(id);

      setProfile(response.profile);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    loadProfile();

  }, [id]);

  if (!profile) {
    return <h2>Loading...</h2>;
  }

  const isOwnProfile = user?._id === profile._id;

  return (

    <div className="profile-page">

      <ProfileHeader
        profile={profile}
        setProfile={setProfile}
        reloadProfile={loadProfile}
        isOwnProfile={isOwnProfile}
      />

      <ProfileStats profile={profile} />

      <AboutCard profile={profile} />

      <UserPosts userId={profile._id} />

    </div>

  );

};

export default PublicProfile;