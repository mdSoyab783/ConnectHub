const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  comment = null,
  conversation = null,
  message = null,
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
      conversation,
      message,
    });

    await notification.populate(
      "sender",
      "fullName username profileImage"
    );

    // Send real-time notification if recipient is online
    if (io && onlineUsers) {
      const socketId = onlineUsers.get(recipient.toString());

      if (socketId) {
        io.to(socketId).emit(
          "newNotification",
          notification
        );

        console.log(
          `📢 ${type} notification sent to ${recipient}`
        );
      }
    }

    return notification;

  } catch (error) {
    console.error(
      "Notification Error:",
      error.message
    );
  }
};

module.exports = createNotification;