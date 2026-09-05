import api from "./api";

/* =====================================================
   GET MESSAGES
===================================================== */

export const getMessages = async (conversationId) => {
  const response = await api.get(
    `/messages/${conversationId}`
  );

  return response.data;
};


/* =====================================================
   MARK SEEN
===================================================== */

export const markMessagesSeen = async (conversationId) => {
  const response = await api.put(
    `/messages/seen/${conversationId}`
  );

  return response.data;
};


/* =====================================================
   SEND MESSAGE
===================================================== */

export const sendMessage = async (
  conversationId,
  text,
  image,
  replyTo = null
) => {
  const formData = new FormData();

  formData.append(
    "conversationId",
    conversationId
  );

  if (text?.trim()) {
    formData.append(
      "text",
      text.trim()
    );
  }

  if (image) {
    formData.append(
      "image",
      image
    );
  }

  // Send replied message ID
  if (replyTo) {
    formData.append(
      "replyTo",
      replyTo
    );
  }

  const response = await api.post(
    "/messages",
    formData
  );

  return response.data;
};


/* =====================================================
   UNREAD COUNTS
===================================================== */

export const getUnreadCounts = async () => {
  const response = await api.get(
    "/messages/unread/counts"
  );

  return response.data;
};


/* =====================================================
   DELETE MESSAGE
===================================================== */

export const deleteMessage = async (messageId) => {
  const response = await api.delete(
    `/messages/${messageId}`
  );

  return response.data;
};


/* =====================================================
   EDIT MESSAGE
===================================================== */

export const editMessage = async (
  messageId,
  text
) => {
  const response = await api.put(
    `/messages/edit/${messageId}`,
    {
      text,
    }
  );

  return response.data;
};


/* =====================================================
   REACT TO MESSAGE
===================================================== */

export const reactToMessage = async (
  messageId,
  emoji
) => {
  const response = await api.post(
    `/messages/react/${messageId}`,
    {
      emoji,
    }
  );

  return response.data;
};


/* =====================================================
   FORWARD MESSAGE
===================================================== */

export const forwardMessage = async (
  messageId,
  targetConversationId
) => {
  const response = await api.post(
    `/messages/forward/${messageId}`,
    {
      targetConversationId,
    }
  );

  return response.data;
};