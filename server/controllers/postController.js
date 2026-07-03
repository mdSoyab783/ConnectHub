const Post = require("../models/Post");

// ===================================
// Create Post
// ===================================
const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({
        success: false,
        message: "Caption is required.",
      });
    }

    const post = await Post.create({
      user: req.user._id,
      caption,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "fullName username profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post: populatedPost,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Get All Posts
// ===================================
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ visibility: "public" })
      .populate("user", "fullName username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalPosts: posts.length,
      posts,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Get Single Post
// ===================================
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "fullName username profileImage bio");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    res.status(200).json({
      success: true,
      post,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// Update Post
// ===================================
const updatePost = async (req, res) => {
  try {

    const { caption } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts.",
      });
    }

    post.caption = caption || post.caption;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "fullName username profileImage");

    res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      post: updatedPost,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ===================================
// Delete Post
// ===================================
const deletePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts."
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully."
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};