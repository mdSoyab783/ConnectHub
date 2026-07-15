import { useState } from "react";
import { FaHeart, FaRegHeart, FaRegCommentDots } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { likePost } from "../../services/postService";
import Card from "../common/Card";
import Avatar from "../common/Avatar";
import { getImageUrl } from "../../utils/image";
import CommentSection from "./CommentSection";

import "./PostCard.css";

const PostCard = ({ post, posts, setPosts }) => {
  const { user } = useAuth();

  const [showComments, setShowComments] = useState(false);

  const userId = user?._id || user?.id;

  const isLiked = post.likes?.includes(userId);

  const handleLike = async () => {
    const previousPosts = [...posts];

    const updatedPosts = posts.map((p) => {
      if (p._id !== post._id) return p;

      return {
        ...p,
        likes: isLiked
          ? p.likes.filter((id) => id !== userId)
          : [...p.likes, userId],
      };
    });

    setPosts(updatedPosts);

    try {
      await likePost(post._id);
    } catch (error) {
      console.error("Like failed:", error);

      // Rollback
      setPosts(previousPosts);
    }
  };

  return (
    <Card className="post-card">

      {/* ================= Header ================= */}

      <div className="post-header">

        <Avatar
          src={post.user?.profileImage}
          alt={post.user?.username}
          size={45}
          className="profile-image"
        />

        <div className="post-user-info">
          <h4>{post.user?.username}</h4>

          <small>
            {new Date(post.createdAt).toLocaleString()}
          </small>
        </div>

      </div>

      {/* ================= Caption ================= */}

      {post.caption && (
        <div className="post-body">
          <p>{post.caption}</p>
        </div>
      )}

      {/* ================= Post Image ================= */}

      {post.image && (
        <img
          src={getImageUrl(post.image)}
          alt="Post"
          className="post-image"
        />
      )}

      {/* ================= Footer ================= */}

      <div className="post-footer">

        <span>❤️ {post.likes?.length || 0}</span>

        <span>💬 {post.commentsCount || 0}</span>

      </div>

      {/* ================= Actions ================= */}

      <div className="post-actions">

        <button onClick={handleLike}>

          {isLiked ? (
            <>
              <FaHeart color="red" /> Liked
            </>
          ) : (
            <>
              <FaRegHeart /> Like
            </>
          )}

        </button>

        <button
          onClick={() => setShowComments(!showComments)}
        >
          <FaRegCommentDots />

          {showComments ? " Hide" : " Comment"}
        </button>

      </div>

      {/* ================= Comments ================= */}

      {showComments && (
        <CommentSection postId={post._id} />
      )}

    </Card>
  );
};

export default PostCard;