import { useRef, useState } from "react";
import { createPost } from "../../services/postService";
import { useAuth } from "../../context/AuthContext";
import "./CreatePost.css";

const CreatePost = () => {
  const { user } = useAuth();

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

  const handleImageChange = (e) => {
    setImage(e.target.files?.[0] || null);
  };

  const removeImage = () => {
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const firstName =
    user?.fullName?.split(" ")[0] ||
    user?.username ||
    "there";

  return (
    <div className="create-post">

      <form onSubmit={submitHandler}>

        {/* Main Composer */}
        <div className="create-post-composer">

          <textarea
            placeholder={`What's on your mind?`}
            value={caption}
            onChange={(e) =>
              setCaption(e.target.value)
            }
          />

          <div className="create-post-actions">

            {/* Photo */}
            <label
              htmlFor="postImage"
              className="create-post-action photo-action"
              title="Add Photo"
            >
              📷
            </label>

            <input
              ref={fileInputRef}
              id="postImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {/* Video */}
            <button
              type="button"
              className="create-post-action video-action"
              title="Video"
              onClick={() => {
                alert("Video posting will be added later.");
              }}
            >
              🎬
            </button>

            {/* Post */}
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

        </div>


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
              onClick={removeImage}
            >
              ✕
            </button>

          </div>
        )}

      </form>

    </div>
  );
};

export default CreatePost;