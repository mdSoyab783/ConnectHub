import { useEffect, useState } from "react";
import { getPosts } from "../../services/postService";
import { useSocket } from "../../context/SocketContext";

import PostCard from "./PostCard";

import "./Feed.css";

const Feed = ({ refreshTrigger }) => {
  const { socket } = useSocket();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPosts(1, 10);

      setPosts(response.posts || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to fetch posts."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Initial Load
  // ===========================
  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  // ===========================
  // Real-time Events
  // ===========================
  useEffect(() => {
    if (!socket) return;

    // New post
    socket.on("newPost", (post) => {
      setPosts((prev) => {
        const exists = prev.some(
          (p) => p._id === post._id
        );

        if (exists) {
          return prev;
        }

        return [post, ...prev];
      });
    });

    // Post like update
    socket.on("postLiked", ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes,
              }
            : post
        )
      );
    });

    return () => {
      socket.off("newPost");
      socket.off("postLiked");
    };
  }, [socket]);

  // ===========================
  // Loading
  // ===========================
  if (loading) {
    return (
      <div className="feed-state">
        <div className="feed-spinner"></div>

        <p>Loading posts...</p>
      </div>
    );
  }

  // ===========================
  // Error
  // ===========================
  if (error) {
    return (
      <div className="feed-state feed-error">

        <div className="feed-state-icon">
          ⚠️
        </div>

        <h3>
          Something went wrong
        </h3>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={fetchPosts}
          className="feed-retry-button"
        >
          Try Again
        </button>

      </div>
    );
  }

  // ===========================
  // Empty Feed
  // ===========================
  if (posts.length === 0) {
    return (
      <div className="feed-state feed-empty">

        <div className="feed-state-icon">
          📝
        </div>

        <h3>
          No posts yet
        </h3>

        <p>
          Be the first person to share
          something with your ConnectHub
          community.
        </p>

      </div>
    );
  }

  // ===========================
  // Feed
  // ===========================
  return (
    <div className="feed">

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          posts={posts}
          setPosts={setPosts}
        />
      ))}

    </div>
  );
};

export default Feed;