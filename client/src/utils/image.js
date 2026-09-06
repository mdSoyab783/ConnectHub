const BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:3000";

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "/default-avatar.png";
  }

  return `${BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};