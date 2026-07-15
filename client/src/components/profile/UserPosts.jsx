import { useEffect, useState } from "react";

import { getPostsByUser } from "../../services/postService";

import PostCard from "../post/PostCard";

const UserPosts = ({ userId }) => {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, [userId]);

  const loadPosts = async () => {
    try {
      const response = await getPostsByUser(userId);

      setPosts(response.posts || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="user-posts">

      <h3>Posts</h3>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            posts={posts}
            setPosts={setPosts}
          />
        ))
      )}

    </div>
  );
};

export default UserPosts;