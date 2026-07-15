const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  comment = null,
  io = null,
  onlineUsers = null,
}) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) {
      return;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment,
    });

    await notification.populate(
      "sender",
      "fullName username profileImage"
    );

    // 🔥 Send instantly if recipient is online
    if (io && onlineUsers) {
      const socketId = onlineUsers.get(recipient.toString());

      if (socketId) {
        io.to(socketId).emit(
          "newNotification",
          notification
        );

        console.log("📢 Real-time notification sent");
      }
    }

    return notification;
  } catch (error) {
    console.error("Notification Error:", error.message);
  }
};

module.exports = createNotification;