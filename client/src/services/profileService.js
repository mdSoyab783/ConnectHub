import api from "./api";

// ===============================
// Get Logged-in User Profile
// ===============================
const getMyProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// ===============================
// Get Any User Profile
// ===============================
const getUserProfile = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ===============================
// Update Profile
// ===============================
const updateProfile = async (data) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

// ===============================
// Upload Profile Image
// ===============================
const uploadProfileImage = async (formData) => {
  const response = await api.put(
    "/users/profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Upload Cover Image
// ===============================
const uploadCoverImage = async (formData) => {
  const response = await api.put(
    "/users/cover-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default {
  getMyProfile,
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  uploadCoverImage,
};