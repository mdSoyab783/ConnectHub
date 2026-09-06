const express = require("express");

const router = express.Router();

const {
  addComment,
  getComments,
  editComment,
  deleteComment,
} = require("../controllers/commentController");

const {
  protect,
} = require("../middleware/authMiddleware");

// =========================================
// ADD COMMENT
// =========================================

router.post(
  "/:postId",
  protect,
  addComment
);


// =========================================
// GET COMMENTS
// =========================================

router.get(
  "/:postId",
  getComments
);


// =========================================
// EDIT COMMENT
// =========================================

router.put(
  "/:commentId",
  protect,
  editComment
);


// =========================================
// DELETE COMMENT
// =========================================

router.delete(
  "/:commentId",
  protect,
  deleteComment
);


module.exports = router;