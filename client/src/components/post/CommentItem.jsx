import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/image";

const CommentItem = ({
  comment,
  replies = [],
  onReply,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();

  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(
    comment.text
  );

  const userId = user?._id || user?.id;

  const commentUserId =
    comment.user?._id ||
    comment.user?.id;

  const isOwner =
    commentUserId?.toString() ===
    userId?.toString();


  // =========================================
  // REPLY INPUT
  // =========================================

  const handleReplyClick = () => {
    setShowReply((previous) => !previous);
  };


  // =========================================
  // SUBMIT REPLY
  // =========================================

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    const text = replyText.trim();

    if (!text) return;

    try {
      await onReply(
        comment._id,
        text
      );

      setReplyText("");
      setShowReply(false);

    } catch (error) {
      console.error(
        "Reply failed:",
        error
      );
    }
  };


  // =========================================
  // EDIT
  // =========================================

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const text = editText.trim();

    if (!text) return;

    try {
      await onEdit(
        comment._id,
        text
      );

      setEditing(false);

    } catch (error) {
      console.error(
        "Edit failed:",
        error
      );
    }
  };


  // =========================================
  // DELETE
  // =========================================

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    onDelete(comment._id);
  };


  return (
    <div className="comment-wrapper">

      {/* =====================================
          COMMENT
      ===================================== */}

      <div className="comment-item">

        {/* AVATAR */}

        <img
          src={getImageUrl(
            comment.user?.profileImage
          )}
          alt={
            comment.user?.username ||
            "User"
          }
          className="comment-avatar"
          onError={(e) => {
            e.currentTarget.src =
              "/default-avatar.png";
          }}
        />


        {/* CONTENT */}

        <div className="comment-content">

          {/* HEADER */}

          <div className="comment-header">

            <strong>
              {comment.user?.username ||
                comment.user?.fullName ||
                "User"}
            </strong>

            <span>
              {new Date(
                comment.createdAt
              ).toLocaleString()}
            </span>

          </div>


          {/* =====================================
              COMMENT TEXT / EDIT
          ===================================== */}

          {editing ? (
            <form
              className="comment-edit-form"
              onSubmit={handleEditSubmit}
            >

              <input
                type="text"
                value={editText}
                onChange={(e) =>
                  setEditText(
                    e.target.value
                  )
                }
                autoFocus
              />

              <button type="submit">
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditText(
                    comment.text
                  );
                }}
              >
                Cancel
              </button>

            </form>
          ) : (
            <p>{comment.text}</p>
          )}


          {/* =====================================
              ACTION BUTTONS
          ===================================== */}

          {!editing && (
            <div className="comment-actions">

              <button
                type="button"
                onClick={handleReplyClick}
              >
                {showReply
                  ? "Cancel"
                  : "Reply"}
              </button>


              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setEditText(
                        comment.text
                      );
                    }}
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className="comment-delete-action"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </>
              )}

            </div>
          )}


          {/* =====================================
              REPLY FORM
          ===================================== */}

          {showReply && !editing && (
            <form
              className="reply-form"
              onSubmit={
                handleReplySubmit
              }
            >

              <img
                src={getImageUrl(
                  user?.profileImage
                )}
                alt=""
                className="reply-input-avatar"
                onError={(e) => {
                  e.currentTarget.src =
                    "/default-avatar.png";
                }}
              />


              <input
                type="text"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) =>
                  setReplyText(
                    e.target.value
                  )
                }
                autoFocus
              />


              <button type="submit">
                Reply
              </button>

            </form>
          )}

        </div>

      </div>


      {/* =====================================
          REPLIES
      ===================================== */}

      {replies.length > 0 && (
        <div className="comment-replies">

          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

        </div>
      )}

    </div>
  );
};

export default CommentItem;