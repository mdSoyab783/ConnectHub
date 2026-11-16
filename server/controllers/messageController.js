
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const createNotification = require("../utils/createNotification");
const uploadImage = require("../utils/imageProcessor");
const deleteCloudinaryImage = require("../utils/deleteCloudinaryImage");

/* =====================================================
   SEND MESSAGE
===================================================== */

exports.sendMessage = async (req, res) => {
  let uploadedImage = null;
  let messageCreated = false;

  try {
    const { conversationId, text, replyTo } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation is required",
      });
    }

    if (!text?.trim() && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or an image",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Upload image to Cloudinary
    if (req.file) {
      uploadedImage = await uploadImage(
        req.file.buffer,
        "messages",
        1200,
        null
      );
    }

    // Validate reply
    let replyMessage = null;

    if (replyTo) {
      replyMessage = await Message.findById(replyTo).populate(
        "sender",
        "fullName username profileImage"
      );

      if (!replyMessage) {
        if (uploadedImage) {
          await deleteCloudinaryImage(uploadedImage.url);
        }

        return res.status(400).json({
          success: false,
          message: "Reply message not found",
        });
      }

      if (
        replyMessage.conversation.toString() !==
        conversationId.toString()
      ) {
        if (uploadedImage) {
          await deleteCloudinaryImage(uploadedImage.url);
        }

        return res.status(400).json({
          success: false,
          message: "Reply message does not belong to this conversation",
        });
      }
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text?.trim() || "",
      image: uploadedImage?.url || "",
      replyTo: replyMessage ? replyMessage._id : null,
      replyPreview: replyMessage
        ? {
            text: replyMessage.text || "",
            image: replyMessage.image || "",
            senderName:
              replyMessage.sender?.fullName ||
              replyMessage.sender?.username ||
              "User",
          }
        : {
            text: "",
            image: "",
            senderName: "",
          },
    });

    messageCreated = true;

    await message.populate([
      {
        path: "sender",
        select: "fullName username profileImage",
      },
      {
        path: "replyTo",
        populate: {
          path: "sender",
          select: "fullName username profileImage",
        },
      },
    ]);

    // Update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // Find recipient
    const recipient = conversation.participants.find(
      (participant) =>
        participant.toString() !== req.user._id.toString()
    );

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    // Delivery status
    if (recipient && onlineUsers) {
      const recipientSocket = onlineUsers.get(recipient.toString());

      if (recipientSocket) {
        message.delivered = true;
        await message.save();

        if (io) {
          io.to(recipientSocket).emit("messageDelivered", {
            messageId: message._id,
          });
        }
      }
    }

    // Notification
    if (recipient) {
      try {
        await createNotification({
          recipient,
          sender: req.user._id,
          type: "message",
          message: message.text || "Sent you an image",
          referenceId: conversationId,
        });
      } catch (notificationError) {
        console.log("Notification Error:", notificationError);
      }
    }

    // Unread message socket
    if (recipient && onlineUsers && io) {
      const recipientSocket = onlineUsers.get(recipient.toString());

      if (recipientSocket) {
        io.to(recipientSocket).emit("newUnreadMessage", {
          conversationId: conversation._id,
          messageId: message._id,
        });
      }
    }

    // Real-time message
    if (io) {
      io.to(conversationId.toString()).emit("receiveMessage", message);
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    // Only clean up if the database message was never created.
    if (uploadedImage && !messageCreated) {
      await deleteCloudinaryImage(uploadedImage.url);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET MESSAGES
===================================================== */

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "fullName username profileImage")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "fullName username profileImage",
        },
      })
      .populate({
        path: "reactions.user",
        select: "fullName username profileImage",
      })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   MARK MESSAGES SEEN
===================================================== */

exports.markMessagesSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      conversation: conversationId,
      sender: { $ne: userId },
      seen: false,
    });

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        $set: {
          seen: true,
          isRead: true,
        },
      }
    );

    const io = req.app.get("io");

    if (io) {
      for (const message of messages) {
        io.to(conversationId.toString()).emit("messageSeen", {
          messageId: message._id,
        });
      }
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UNREAD COUNTS
===================================================== */

exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    });

    const unread = [];

    for (const conversation of conversations) {
      const count = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: userId },
        isRead: false,
      });

      if (count > 0) {
        unread.push({
          _id: conversation._id,
          count,
        });
      }
    }

    res.json({
      success: true,
      unread,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   DELETE MESSAGE
===================================================== */

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    const conversationId = message.conversation;
    const imageUrl = message.image;

    await Message.findByIdAndDelete(messageId);

    // Check whether another message or reply preview still uses this image.
    if (imageUrl) {
      const imageStillInUse = await Message.exists({
        _id: { $ne: messageId },
        $or: [
          { image: imageUrl },
          { "replyPreview.image": imageUrl },
        ],
      });

      if (!imageStillInUse) {
        await deleteCloudinaryImage(imageUrl);
      }
    }

    const io = req.app.get("io");

    if (io) {
      io.to(conversationId.toString()).emit("messageDeleted", {
        messageId,
        conversationId,
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
      messageId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   EDIT MESSAGE
===================================================== */

exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    message.text = text.trim();
    message.edited = true;

    await message.save();

    await message.populate([
      {
        path: "sender",
        select: "fullName username profileImage",
      },
      {
        path: "replyTo",
        populate: {
          path: "sender",
          select: "fullName username profileImage",
        },
      },
    ]);

    const io = req.app.get("io");

    if (io) {
      io.to(message.conversation.toString()).emit("messageEdited", {
        message,
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   REACT TO MESSAGE
===================================================== */

exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji || !emoji.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reaction emoji is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const userId = req.user._id.toString();

    const existingReaction = message.reactions.find(
      (reaction) => reaction.user.toString() === userId
    );

    if (existingReaction && existingReaction.emoji === emoji.trim()) {
      message.reactions = message.reactions.filter(
        (reaction) => reaction.user.toString() !== userId
      );
    } else if (existingReaction) {
      existingReaction.emoji = emoji.trim();
    } else {
      message.reactions.push({
        user: req.user._id,
        emoji: emoji.trim(),
      });
    }

    await message.save();

    await message.populate({
      path: "reactions.user",
      select: "fullName username profileImage",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(message.conversation.toString()).emit("messageReaction", {
        messageId: message._id,
        conversationId: message.conversation,
        reactions: message.reactions,
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Reaction Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   FORWARD MESSAGE
===================================================== */

exports.forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetConversationId } = req.body;

    if (!targetConversationId) {
      return res.status(400).json({
        success: false,
        message: "Target conversation is required",
      });
    }

    const originalMessage = await Message.findById(messageId).populate(
      "sender",
      "fullName username profileImage"
    );

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: "Original message not found",
      });
    }

    const targetConversation = await Conversation.findById(
      targetConversationId
    );

    if (!targetConversation) {
      return res.status(404).json({
        success: false,
        message: "Target conversation not found",
      });
    }

    const currentUserIsParticipant =
      targetConversation.participants.some(
        (participant) =>
          participant.toString() === req.user._id.toString()
      );

    if (!currentUserIsParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    // Reuse the original Cloudinary URL. Do not upload a duplicate.
    const forwardedMessage = await Message.create({
      conversation: targetConversationId,
      sender: req.user._id,
      text: originalMessage.text || "",
      image: originalMessage.image || "",
      delivered: false,
      seen: false,
      isRead: false,
      edited: false,
      forwarded: true,
      replyTo: null,
      replyPreview: {
        text: "",
        image: "",
        senderName: "",
      },
    });

    await forwardedMessage.populate({
      path: "sender",
      select: "fullName username profileImage",
    });

    targetConversation.lastMessage = forwardedMessage._id;
    await targetConversation.save();

    const recipient = targetConversation.participants.find(
      (participant) =>
        participant.toString() !== req.user._id.toString()
    );

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (recipient && onlineUsers) {
      const recipientSocket = onlineUsers.get(recipient.toString());

      if (recipientSocket) {
        forwardedMessage.delivered = true;
        await forwardedMessage.save();

        if (io) {
          io.to(recipientSocket).emit("messageDelivered", {
            messageId: forwardedMessage._id,
          });
        }
      }
    }

    if (io) {
      io.to(targetConversationId.toString()).emit(
        "receiveMessage",
        forwardedMessage
      );
    }

    if (recipient) {
      try {
        await createNotification({
          recipient,
          sender: req.user._id,
          type: "message",
          message:
            forwardedMessage.text || "Forwarded you an image",
          referenceId: targetConversationId,
        });
      } catch (notificationError) {
        console.log("Notification Error:", notificationError);
      }
    }

    if (recipient && onlineUsers && io) {
      const recipientSocket = onlineUsers.get(recipient.toString());

      if (recipientSocket) {
        io.to(recipientSocket).emit("newUnreadMessage", {
          conversationId: targetConversation._id,
          messageId: forwardedMessage._id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: forwardedMessage,
    });
  } catch (error) {
    console.error("Forward Message Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
