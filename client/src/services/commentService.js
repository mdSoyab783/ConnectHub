import api from "./api";

// Get comments for a post
export const getComments = async (postId) => {
  const response = await api.get(`/comments/${postId}`);
  return response.data;
};

// Add a comment
export const addComment = async (postId, text) => {
  const response = await api.post(`/comments/${postId}`, {
    text,
  });

  return response.data;
};

// Delete comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
