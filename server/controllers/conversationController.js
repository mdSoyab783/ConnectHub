const Conversation = require("../models/Conversation");

// =====================================
// Create or Get Conversation
// =====================================
exports.createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Prevent chatting with yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user._id, receiverId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      });
    }

    await conversation.populate(
      "participants",
      "fullName username profileImage"
    );

    res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get My Conversations
// =====================================
exports.getConversations = async (req, res) => {
  try {

    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate(
        "participants",
        "fullName username profileImage"
      )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName username",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};