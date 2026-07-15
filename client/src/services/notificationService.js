import api from "./api";

// ==========================
// Get Notifications
// ==========================
const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// ==========================
// Mark One Read
// ==========================
const markAsRead = async (id) => {
  const response = await api.put(
    `/notifications/${id}/read`
  );

  return response.data;
};

// ==========================
// Mark All Read
// ==========================
const markAllRead = async () => {
  const response = await api.put(
    "/notifications/read-all"
  );

  return response.data;
};

export default {
  getNotifications,
  markAsRead,
  markAllRead,
};