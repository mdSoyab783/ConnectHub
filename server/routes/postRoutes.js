const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getPostsByUser,
} = require("../controllers/postController");

// =====================
// Public Routes
// =====================
router.get("/", getAllPosts);

// IMPORTANT: Put this BEFORE "/:id"
router.get("/user/:userId", getPostsByUser);

router.get("/:id", getPostById);

// =====================
// Protected Routes
// =====================
router.post(
  "/",
  protect,
  upload.single("postImage"),
  createPost
);

router.put("/:id/like", protect, toggleLike);

router.put("/:id", protect, updatePost);

router.delete("/:id", protect, deletePost);

module.exports = router;