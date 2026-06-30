const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateProfile,
} = require("../controllers/userController");

// Get My Profile
router.get("/profile", protect, getMyProfile);

// Update Profile
router.put("/profile", protect, updateProfile);

module.exports = router;