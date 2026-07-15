import { useState } from "react";
import profileService from "../../services/profileService";
const EditProfileModal = ({
  profile,
  reloadProfile,
  closeModal,
}) => {

  const [form, setForm] = useState({
    fullName: profile.fullName || "",
    bio: profile.bio || "",
    college: profile.college || "",
    location: profile.location || "",
    skills: profile.skills?.join(",") || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await profileService.updateProfile(form);

      reloadProfile();

      closeModal();

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit}>

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
          />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
          />

          <input
            name="college"
            value={form.college}
            onChange={handleChange}
            placeholder="College"
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
          />

          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="React,Node,Express"
          />

          <div className="modal-buttons">

            <button
              type="button"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="submit">
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditProfileModal;