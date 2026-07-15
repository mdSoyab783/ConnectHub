import api from "./api";

const searchUsers = async (keyword) => {
  const response = await api.get(
    `/users/search?keyword=${keyword}`
  );

  return response.data;
};

const followUser = async (userId) => {
  const response = await api.put(
    `/users/${userId}/follow`
  );

  return response.data;
};

const unfollowUser = async (userId) => {
  const response = await api.put(
    `/users/${userId}/unfollow`
  );

  return response.data;
};
const getSuggestions = async () => {
  const response = await api.get("/users/suggestions");
  return response.data;
};
export const getFollowing = async (userId) => {
  const response = await api.get(`/users/${userId}/following`);
  return response.data;
};
export default {
  searchUsers,
  followUser,
  unfollowUser,
  getSuggestions,
  getFollowing,
};