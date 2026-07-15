import { useState } from "react";
import { createPost } from "../../services/postService";
import "./CreatePost.css";

const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!caption.trim() && !image) {
      alert("Please enter a caption or choose an image.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);

      if (image) {
        formData.append("postImage", image);
      }

      const data = await createPost(formData);

      console.log(data);

      alert("Post created successfully!");

      setCaption("");
      setImage(null);

      // Reset file input
      document.getElementById("postImage").value = "";

    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to create post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">

      <h2>Create Post</h2>

      <form onSubmit={submitHandler}>

        <textarea
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <input
          id="postImage"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>

      </form>

    </div>
  );
};

export default CreatePost;