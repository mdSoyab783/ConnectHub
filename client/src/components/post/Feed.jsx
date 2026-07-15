import { useEffect, useState } from "react";
import { getPosts } from "../../services/postService";
import { useSocket } from "../../context/SocketContext";

import PostCard from "./PostCard";

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

  // Initial Load
  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  // ===========================
  // Real-time New Posts
  // ===========================
  useEffect(() => {
  if (!socket) return;

  socket.on("newPost", (post) => {
    setPosts((prev) => {
      const exists = prev.some((p) => p._id === post._id);

      if (exists) return prev;

      return [post, ...prev];
    });
  });

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

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (posts.length === 0) {
    return <p>No posts yet.</p>;
  }

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