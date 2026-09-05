import { useState } from "react";

import profileService from "../../services/profileService";

import "./EditProfileModal.css";

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
    skills: profile.skills?.join(", ") || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const updatedData = {
        ...form,

        // Convert comma-separated skills into an array
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
      };

      await profileService.updateProfile(updatedData);

      await reloadProfile();

      closeModal();

    } catch (error) {
      console.error("Profile update error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="edit-modal-overlay"
      onMouseDown={handleOverlayClick}
    >

      <div
        className="edit-profile-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <div className="edit-modal-header">

          <div>
            <h2>Edit Profile</h2>

            <p>
              Update your profile information
            </p>
          </div>

          <button
            type="button"
            className="edit-modal-close"
            onClick={closeModal}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        {/* FORM */}

        <form
          className="edit-profile-form"
          onSubmit={handleSubmit}
        >

          {/* FULL NAME */}

          <div className="edit-form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

          </div>


          {/* BIO */}

          <div className="edit-form-group">

            <label htmlFor="bio">
              Bio
            </label>

            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell people something about yourself..."
              rows="4"
            />

          </div>


          {/* COLLEGE */}

          <div className="edit-form-group">

            <label htmlFor="college">
              College
            </label>

            <input
              id="college"
              type="text"
              name="college"
              value={form.college}
              onChange={handleChange}
              placeholder="Enter your college"
            />

          </div>


          {/* LOCATION */}

          <div className="edit-form-group">

            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter your location"
            />

          </div>


          {/* SKILLS */}

          <div className="edit-form-group">

            <label htmlFor="skills">
              Skills
            </label>

            <input
              id="skills"
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
            />

            <small>
              Separate skills using commas
            </small>

          </div>


          {/* ERROR */}

          {error && (
            <div className="edit-profile-error">
              ⚠️ {error}
            </div>
          )}


          {/* BUTTONS */}

          <div className="edit-modal-buttons">

            <button
              type="button"
              className="edit-cancel-btn"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-save-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditProfileModal;