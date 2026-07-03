const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// Public Routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected Routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;