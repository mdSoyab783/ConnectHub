const fs = require("fs");
const processImage = require("../utils/imageProcessor");
const User = require("../models/User");
const path = require("path");
const createNotification = require("../utils/createNotification");
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
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Follow User
// ========================================
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(currentUserId);

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();
    const io = req.app.get("io");
const onlineUsers = req.app.get("onlineUsers");

await createNotification({
  recipient: targetUser._id,
  sender: currentUser._id,
  type: "follow",
  io,
  onlineUsers,
});
    res.status(200).json({
      success: true,
      message: "User followed successfully",

      followers: targetUser.followers.length,
      following: currentUser.following.length,

      isFollowing: true,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ========================================
// Unfollow User
// ========================================
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(currentUserId);

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",

      followers: targetUser.followers.length,
      following: currentUser.following.length,

      isFollowing: false,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ========================================
// Get Followers
// ========================================
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "fullName username profileImage bio");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      followers: user.followers,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ========================================
// Get Following
// ========================================
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following", "fullName username profileImage bio");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      following: user.following,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ========================================
// Get Public User Profile
// ========================================
const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password -email")
      .populate("followers", "_id")
      .populate("following", "_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const Post = require("../models/Post");

    const totalPosts = await Post.countDocuments({
      user: user._id,
    });

    let isFollowing = false;

    if (req.user) {
      isFollowing = user.followers.some(
        (follower) =>
          follower._id.toString() === req.user._id.toString()
      );
    }

    res.status(200).json({
      success: true,

      profile: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
        college: user.college,
        location: user.location,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        projects: user.projects,

        followers: user.followers.length,
        following: user.following.length,

        isFollowing,

        posts: totalPosts,

        createdAt: user.createdAt,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ========================================
// Upload Profile Image
// ========================================
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(req.user._id);

    // Delete previous profile image (optional, but recommended)
    if (user.profileImage) {
      const oldImage = path.join(__dirname, "..", user.profileImage);

      if (fs.existsSync(oldImage)) {
        fs.unlinkSync(oldImage);
      }
    }

    const optimizedImage = await processImage(
      req.file.path,
      path.join(__dirname, "../uploads/profile"),
      300,
      300
    );

    user.profileImage = optimizedImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ========================================
// Upload Cover Image
// ========================================
const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(req.user._id);

    if (user.coverImage) {
      const oldImage = path.join(__dirname, "..", user.coverImage);

      if (fs.existsSync(oldImage)) {
        fs.unlinkSync(oldImage);
      }
    }

    const optimizedImage = await processImage(
      req.file.path,
      path.join(__dirname, "../uploads/cover"),
      1200,
      400
    );

    user.coverImage = optimizedImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cover image uploaded successfully",
      coverImage: user.coverImage,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// Search Users
// ======================================
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const users = await User.find({
      $or: [
        {
          fullName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          username: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .select("fullName username profileImage")
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ========================================
// Suggested Users
// ========================================
const getSuggestedUsers = async (req, res) => {
  try {

    const currentUser = await User.findById(req.user._id);

    const excludeUsers = [
      req.user._id,
      ...currentUser.following,
    ];

    const users = await User.find({
      _id: {
        $nin: excludeUsers,
      },
    })
      .select(
        "fullName username profileImage bio"
      )
      .limit(5);

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ========================================
// Export Controllers
// ========================================
module.exports = {
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
};