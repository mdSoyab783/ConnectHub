const Post = require("../models/Post");
const asyncHandler = require("../middleware/asyncHandler");
const createNotification = require("../utils/createNotification");
const uploadImage = require("../utils/imageProcessor");
const deleteCloudinaryImage = require("../utils/deleteCloudinaryImage");

// ===================================
// Create Post
// ===================================
const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;

  if ((!caption || caption.trim() === "") && !req.file) {
    return res.status(400).json({
      success: false,
      message: "Post must contain a caption or an image",
    });
  }

  let uploadedImage = null;

  try {
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "posts", 1200, null);
    }

    let post;

    try {
      post = await Post.create({
        user: req.user._id,
        caption: caption ? caption.trim() : "",
        image: uploadedImage ? uploadedImage.url : "",
      });
    } catch (databaseError) {
      if (uploadedImage) {
        await deleteCloudinaryImage(uploadedImage.url);
      }

      throw databaseError;
    }

    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "fullName username profileImage",
    );

    const io = req.app.get("io");

    if (io) {
      io.emit("newPost", populatedPost);
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    throw error;
  }
});

// ===================================
// Get All Posts (Pagination + Search)
// ===================================
const getAllPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";

  const filter = {};

  if (search) {
    filter.caption = {
      $regex: search,
      $options: "i",
    };
  }

  const totalPosts = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .populate("user", "fullName username profileImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
    posts,
  });
});

// ===================================
// Get Single Post
// ===================================
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "user",
    "fullName username profileImage bio",
  );

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
});

// ===================================
// Update Post
// ===================================
const updatePost = asyncHandler(async (req, res) => {
  const { caption } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found.",
    });
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only edit your own posts.",
    });
  }

  post.caption = caption || post.caption;

  await post.save();

  const updatedPost = await Post.findById(post._id).populate(
    "user",
    "fullName username profileImage",
  );

  res.status(200).json({
    success: true,
    message: "Post updated successfully.",
    post: updatedPost,
  });
});

// ===================================
// Delete Post
// ===================================
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found.",
    });
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own posts.",
    });
  }

  const imageUrl = post.image;

  await post.deleteOne();

  // Delete Cloudinary image after successful database deletion.
  if (imageUrl) {
    await deleteCloudinaryImage(imageUrl);
  }

  res.status(200).json({
    success: true,
    message: "Post deleted successfully.",
  });
});

// ===================================
// Like / Unlike Post
// ===================================
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found.",
    });
  }

  const alreadyLiked = post.likes.some(
    (id) => id.toString() === req.user._id.toString(),
  );

  const io = req.app.get("io");
  const onlineUsers = req.app.get("onlineUsers");

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString(),
    );

    await post.save();

    if (io) {
      io.emit("postLiked", {
        postId: post._id,
        likes: post.likes,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post unliked.",
      totalLikes: post.likes.length,
    });
  }

  post.likes.push(req.user._id);

  await post.save();

  if (io) {
    io.emit("postLiked", {
      postId: post._id,
      likes: post.likes,
    });
  }

  await createNotification({
    recipient: post.user,
    sender: req.user._id,
    type: "like",
    post: post._id,
    io,
    onlineUsers,
  });

  return res.status(200).json({
    success: true,
    message: "Post liked.",
    totalLikes: post.likes.length,
  });
});

// ===================================
// Get Posts By User
// ===================================
const getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    user: req.params.userId,
  })
    .populate("user", "fullName username profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: posts.length,
    posts,
  });
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getPostsByUser,
};
