const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// ==========================================
// Send Message
// ==========================================
exports.sendMessage = async (req, res) => {
  try {

    const { conversationId, text } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation is required",
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
    });

    await message.populate(
      "sender",
      "fullName username profileImage"
    );

    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: message._id,
      }
    );

    res.status(201).json({
      success: true,
      message,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Messages
// ==========================================
exports.getMessages = async (req, res) => {

  try {

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate(
        "sender",
        "fullName username profileImage"
      )
      .sort({
        createdAt: 1,
      });

    res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};