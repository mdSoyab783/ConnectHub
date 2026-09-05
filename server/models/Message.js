const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    delivered: {
      type: Boolean,
      default: false,
    },

    seen: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    edited: {
      type: Boolean,
      default: false,
    },
    forwarded: {
  type: Boolean,
  default: false,
},

    /* =====================================================
       REPLY
    ===================================================== */

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    replyPreview: {
      text: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      senderName: {
        type: String,
        default: "",
      },
    },

    /* =====================================================
       REACTIONS
    ===================================================== */

    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        emoji: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Message",
  messageSchema
);