import { useAuth } from "../../context/AuthContext";

const BASE_URL = "http://localhost:3000";

const CommentItem = ({ comment, onDelete }) => {
  const { user } = useAuth();

  const userId = user?._id || user?.id;

  const imageUrl = comment.user?.profileImage
    ? `${BASE_URL}/${comment.user.profileImage.replace(/^\/+/, "")}`
    : "/default-avatar.png";

  return (
    <div className="comment-item">
      <img
        src={imageUrl}
        alt={comment.user?.username}
        className="comment-avatar"
        onError={(e) => {
          e.target.src = "/default-avatar.png";
        }}
      />

      <div className="comment-content">
        <div className="comment-header">
          <strong>{comment.user?.username}</strong>

          <span>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>

        <p>{comment.text}</p>

        {comment.user?._id === userId && (
          <button
            className="delete-comment-btn"
            onClick={() => onDelete(comment._id)}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;