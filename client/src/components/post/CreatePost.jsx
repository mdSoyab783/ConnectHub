import { useRef, useState } from "react";
import { createPost } from "../../services/postService";
import "./CreatePost.css";

const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">

      {/* Header */}
      <div className="create-post-header">
        <div className="create-post-icon">
          ✨
        </div>

        <div>
          <h2>Create Post</h2>

          <p>
            Share something with your community
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submitHandler}>

        {/* Caption */}
        <textarea
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) =>
            setCaption(e.target.value)
          }
        />

        {/* Selected Image */}
        {image && (
          <div className="selected-image">

            <div className="selected-image-info">
              <span>🖼️</span>

              <span>
                {image.name}
              </span>
            </div>

            <button
              type="button"
              className="remove-image-button"
              onClick={() => {
                setImage(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              ✕
            </button>

          </div>
        )}

        {/* Bottom Actions */}
        <div className="create-post-actions">

          <label
            htmlFor="postImage"
            className="image-upload-button"
          >
            📷
            <span>Add Photo</span>
          </label>

          <input
            ref={fileInputRef}
            id="postImage"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(
                e.target.files?.[0] || null
              );
            }}
          />

          <button
            type="submit"
            className="post-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Posting...
              </>
            ) : (
              "Post"
            )}
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreatePost;