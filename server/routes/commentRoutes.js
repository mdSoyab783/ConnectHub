const express = require("express");

const router = express.Router();

const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

// Add Comment
router.post("/:postId", protect, addComment);

// Get Comments
router.get("/:postId", getComments);

// Delete Comment
router.delete("/:commentId", protect, deleteComment);

module.exports = router;