const BASE_URL = "https://connecthub-ad1z.onrender.com";

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "/default-avatar.png";
  }

  return `${BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};