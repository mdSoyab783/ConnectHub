import api from "./api";

// =========================================
// GET COMMENTS
// =========================================

export const getComments = async (postId) => {
  const response = await api.get(
    `/comments/${postId}`
  );

  return response.data;
};


// =========================================
// ADD COMMENT / REPLY
// =========================================

export const addComment = async (
  postId,
  text,
  parentComment = null
) => {
  const response = await api.post(
    `/comments/${postId}`,
    {
      text,
      parentComment,
    }
  );

  return response.data;
};


// =========================================
// EDIT COMMENT / REPLY
// =========================================

export const editComment = async (
  commentId,
  text
) => {
  const response = await api.put(
    `/comments/${commentId}`,
    {
      text,
    }
  );

  return response.data;
};


// =========================================
// DELETE COMMENT / REPLY
// =========================================

export const deleteComment = async (
  commentId
) => {
  const response = await api.delete(
    `/comments/${commentId}`
  );

  return response.data;
};