import api from "./api";

// Get Feed
export const getPosts = async (page = 1, limit = 10) => {
  const response = await api.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

// Create Post
export const createPost = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Like
export const likePost = async (postId) => {
  const response = await api.put(`/posts/${postId}/like`);
  return response.data;
};

// User Posts
export const getPostsByUser = async (userId) => {
  const response = await api.get(`/posts/user/${userId}`);
  return response.data;
};