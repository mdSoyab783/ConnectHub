import { useEffect, useState } from "react";
import { getComments, addComment } from "../../services/commentService";
import CommentItem from "./CommentItem";
import "./CommentSection.css";
import { useAuth } from "../../context/AuthContext";
import { deleteComment } from "../../services/commentService";
import { useSocket } from "../../context/SocketContext";
const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();
  const [text, setText] = useState("");

  useEffect(() => {
    fetchComments();
  }, [postId]);
useEffect(() => {
  if (!socket) return;

  const handleNewComment = (data) => {
    if (data.postId !== postId) return;

    // Ignore comments created by this user
    if (data.comment.user._id === (user.id || user._id)) return;

    setComments((prev) => {
      const exists = prev.some(
        (comment) => comment._id === data.comment._id
      );

      if (exists) return prev;

      return [data.comment, ...prev];
    });
  };

  socket.on("postCommented", handleNewComment);

  return () => {
    socket.off("postCommented", handleNewComment);
  };
}, [socket, postId, user]);
  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await getComments(postId);

      setComments(response.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!text.trim()) return;

  const commentText = text.trim();

  const optimisticComment = {
    _id: `temp-${Date.now()}`,
    text: commentText,
    createdAt: new Date().toISOString(),
    user: {
      _id: user._id || user.id,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
    },
  };

  // Add immediately
  setComments((prev) => [optimisticComment, ...prev]);

  setText("");

  try {
    const response = await addComment(postId, commentText);

    // Replace temporary comment
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === optimisticComment._id
          ? response.comment
          : comment
      )
    );

  } catch (error) {

    console.error(error);

    // Rollback
    setComments((prev) =>
      prev.filter((comment) => comment._id !== optimisticComment._id)
    );
  }
};
const handleDelete = async (commentId) => {
  const previousComments = [...comments];

  // Optimistic removal
  setComments((prev) =>
    prev.filter((comment) => comment._id !== commentId)
  );

  try {
    await deleteComment(commentId);
  } catch (error) {
    console.error(error);

    // Rollback if API fails
    setComments(previousComments);
  }
};
  return (
    <div className="comment-section">
      <h4>Comments</h4>

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onDelete={handleDelete}
          />
        ))
      )}

      <form
        className="comment-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="submit">
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;