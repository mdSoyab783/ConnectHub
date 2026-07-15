const express = require("express");

const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserProfile,
  uploadProfileImage,
  uploadCoverImage,
  searchUsers,
  getSuggestedUsers,
} = require("../controllers/userController");

// =========================
// Profile
// =========================
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateProfile);

// =========================
// Upload Images
// =========================
router.put(
  "/profile-image",
  protect,
  upload.single("profileImage"),
  uploadProfileImage
);

router.put(
  "/cover-image",
  protect,
  upload.single("coverImage"),
  uploadCoverImage
);

// =========================
// Search & Suggestions
// =========================
router.get("/search", searchUsers);

router.get(
  "/suggestions",
  protect,
  getSuggestedUsers
);

// =========================
// Follow System
// =========================
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);

router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// =========================
// Public Profile
// =========================
router.get("/:id", protect, getUserProfile);

module.exports = router;