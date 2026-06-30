const User = require("../models/User");

// ========================================
// Get Logged-in User Profile
// ========================================
const getMyProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Update User Profile
// ========================================
const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      bio,
      college,
      location,
      skills,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.college = college || user.college;
    user.location = location || user.location;

    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim());
    }

    await user.save();
    res.status(200).json({
  success: true,
  message: "Profile updated successfully.",
  user: {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    bio: user.bio,
    college: user.college,
    location: user.location,
    skills: user.skills,
    followers: user.followers,
    following: user.following,
    education: user.education,
    experience: user.experience,
    projects: user.projects,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
};