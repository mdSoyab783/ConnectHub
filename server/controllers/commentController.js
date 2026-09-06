const Comment = require("../models/Comment");
const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");

// =========================================
// ADD COMMENT / REPLY
// =========================================

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, parentComment } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    // =====================================
    // FIND POST
    // =====================================

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // =====================================
    // CHECK PARENT COMMENT
    // =====================================

    if (parentComment) {
      const parent = await Comment.findById(parentComment);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }

      // Make sure parent belongs to the same post
      if (parent.post.toString() !== postId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent comment",
        });
      }
    }

    // =====================================
    // CREATE COMMENT / REPLY
    // =====================================

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentComment || null,
    });

    await comment.populate(
      "user",
      "fullName username profileImage"
    );

    // =====================================
    // INCREASE COMMENT COUNT
    // =====================================

    post.commentsCount += 1;

    await post.save();

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    // =====================================
    // REAL-TIME NEW COMMENT / REPLY
    // =====================================

    io.emit("postCommented", {
      postId: post._id,
      comment,
      commentsCount: post.commentsCount,
    });

    // =====================================
    // NOTIFICATION
    // =====================================

    await createNotification({
      recipient: post.user,
      sender: req.user._id,
      type: "comment",
      post: post._id,
      comment: comment._id,
      io,
      onlineUsers,
    });

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(201).json({
      success: true,
      message: parentComment
        ? "Reply added successfully"
        : "Comment added successfully",
      comment,
      commentsCount: post.commentsCount,
    });

  } catch (error) {
    console.error(
      "Add comment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================================
// GET COMMENTS
// =========================================

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
    })
      .populate(
        "user",
        "fullName username profileImage"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });

  } catch (error) {
    console.error(
      "Get comments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================================
// EDIT COMMENT
// =========================================

exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment =
      await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // =====================================
    // AUTHORIZATION
    // =====================================

    if (
      comment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // =====================================
    // UPDATE COMMENT
    // =====================================

    comment.text = text.trim();

    await comment.save();

    await comment.populate(
      "user",
      "fullName username profileImage"
    );

    const io = req.app.get("io");

    // =====================================
    // REAL-TIME COMMENT UPDATE
    // =====================================

    io.emit("commentUpdated", {
      postId: comment.post,
      comment,
    });

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });

  } catch (error) {
    console.error(
      "Edit comment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================================
// DELETE COMMENT
// =========================================

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment =
      await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // =====================================
    // AUTHORIZATION
    // =====================================

    if (
      comment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // =====================================
    // DELETE REPLIES TOO
    // =====================================

    const replyCount = await Comment.countDocuments({
      parentComment: comment._id,
    });

    await Comment.deleteMany({
      parentComment: comment._id,
    });

    // =====================================
    // UPDATE POST COMMENT COUNT
    // =====================================

    const totalDeleted = 1 + replyCount;

    const updatedPost =
      await Post.findByIdAndUpdate(
        comment.post,
        {
          $inc: {
            commentsCount: -totalDeleted,
          },
        },
        {
          new: true,
        }
      );

    const io = req.app.get("io");

    // =====================================
    // REAL-TIME DELETE
    // =====================================

    io.emit("commentDeleted", {
      postId: updatedPost._id,
      commentId: comment._id,
      commentsCount:
        updatedPost.commentsCount,
    });

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentsCount:
        updatedPost.commentsCount,
    });

  } catch (error) {
    console.error(
      "Delete comment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};