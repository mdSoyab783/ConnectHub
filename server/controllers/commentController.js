const Comment = require("../models/Comment");
const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
  post: postId,
  user: req.user._id,
  text,
});

await comment.populate(
  "user",
  "fullName username profileImage"
);

post.commentsCount += 1;
await post.save();

const io = req.app.get("io");
const onlineUsers = req.app.get("onlineUsers");

io.emit("postCommented", {
  postId: post._id,
  commentsCount: post.commentsCount,
});

await createNotification({
  recipient: post.user,
  sender: req.user._id,
  type: "comment",
  post: post._id,
  comment: comment._id,
  io,
  onlineUsers,
});

res.status(201).json({
  success: true,
  message: "Comment added successfully",
  comment,
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
    })
      .populate("user", "fullName username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

const updatedPost = await Post.findByIdAndUpdate(
  comment.post,
  {
    $inc: {
      commentsCount: -1,
    },
  },
  {
    new: true,
  }
);

const io = req.app.get("io");

io.emit("commentDeleted", {
  postId: updatedPost._id,
  commentId: comment._id,
  commentsCount: updatedPost.commentsCount,
});

await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};