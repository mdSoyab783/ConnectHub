import {
  useEffect,
  useState,
} from "react";

import {
  getComments,
  addComment,
  editComment,
  deleteComment,
} from "../../services/commentService";

import CommentItem from "./CommentItem";

import "./CommentSection.css";

import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { getImageUrl } from "../../utils/image";


const CommentSection = ({ postId }) => {

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  const { user } = useAuth();
  const { socket } = useSocket();


  // =========================================
  // FETCH COMMENTS
  // =========================================

  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await getComments(postId);

      // Make sure only valid comments enter state
      const validComments = Array.isArray(
        response?.comments
      )
        ? response.comments.filter(Boolean)
        : [];

      setComments(validComments);

    } catch (error) {

      console.error(
        "Failed to fetch comments:",
        error
      );

      setComments([]);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchComments();
  }, [postId]);


  // =========================================
  // REAL-TIME NEW COMMENT / REPLY
  // =========================================

  useEffect(() => {

    if (!socket) return;

    const handleNewComment = (data) => {

      if (
        data?.postId?.toString() !==
        postId?.toString()
      ) {
        return;
      }

      // Make sure socket sent a comment
      if (!data?.comment) {
        return;
      }

      const currentUserId =
        user?._id || user?.id;

      const commentUserId =
        data.comment?.user?._id ||
        data.comment?.user?.id;


      // Ignore own Socket.IO event
      if (
        currentUserId &&
        commentUserId &&
        currentUserId.toString() ===
          commentUserId.toString()
      ) {
        return;
      }


      setComments((previous) => {

        // Remove any accidental undefined values
        const cleanComments =
          previous.filter(Boolean);


        // Prevent duplicate comment
        const exists =
          cleanComments.some(
            (comment) =>
              comment?._id?.toString() ===
              data.comment?._id?.toString()
          );


        if (exists) {
          return cleanComments;
        }


        return [
          data.comment,
          ...cleanComments,
        ];

      });

    };


    socket.on(
      "postCommented",
      handleNewComment
    );


    return () => {

      socket.off(
        "postCommented",
        handleNewComment
      );

    };

  }, [
    socket,
    postId,
    user,
  ]);


  // =========================================
  // REAL-TIME EDIT
  // =========================================

  useEffect(() => {

    if (!socket) return;

    const handleCommentUpdated = (data) => {

      if (
        data?.postId?.toString() !==
        postId?.toString()
      ) {
        return;
      }

      if (!data?.comment?._id) {
        return;
      }


      setComments((previous) => {

        return previous
          .filter(Boolean)
          .map((comment) =>
            comment?._id?.toString() ===
            data.comment?._id?.toString()
              ? data.comment
              : comment
          );

      });

    };


    socket.on(
      "commentUpdated",
      handleCommentUpdated
    );


    return () => {

      socket.off(
        "commentUpdated",
        handleCommentUpdated
      );

    };

  }, [
    socket,
    postId,
  ]);


  // =========================================
  // REAL-TIME DELETE
  // =========================================

  useEffect(() => {

    if (!socket) return;

    const handleCommentDeleted = (data) => {

      if (
        data?.postId?.toString() !==
        postId?.toString()
      ) {
        return;
      }

      if (!data?.commentId) {
        return;
      }


      const deletedId =
        data.commentId.toString();


      setComments((previous) => {

        return previous
          .filter(Boolean)
          .filter((comment) => {

            if (
              comment?._id?.toString() ===
              deletedId
            ) {
              return false;
            }


            if (
              comment?.parentComment
                ?.toString() ===
              deletedId
            ) {
              return false;
            }


            return true;

          });

      });

    };


    socket.on(
      "commentDeleted",
      handleCommentDeleted
    );


    return () => {

      socket.off(
        "commentDeleted",
        handleCommentDeleted
      );

    };

  }, [
    socket,
    postId,
  ]);


  // =========================================
  // ADD MAIN COMMENT
  // =========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const commentText =
      text.trim();


    if (!commentText) {
      return;
    }


    try {

      const response =
        await addComment(
          postId,
          commentText
        );


      if (!response?.comment) {
        console.error(
          "Server did not return comment:",
          response
        );

        return;
      }


      setComments((previous) => {

        const cleanComments =
          previous.filter(Boolean);


        const exists =
          cleanComments.some(
            (comment) =>
              comment?._id?.toString() ===
              response.comment?._id?.toString()
          );


        if (exists) {
          return cleanComments;
        }


        return [
          response.comment,
          ...cleanComments,
        ];

      });


      setText("");

    } catch (error) {

      console.error(
        "Add comment failed:",
        error
      );

    }

  };


  // =========================================
  // ADD REPLY
  // =========================================

  const handleReply = async (
    parentCommentId,
    replyText
  ) => {

    if (!parentCommentId) {
      throw new Error(
        "Parent comment ID is missing"
      );
    }


    if (!replyText?.trim()) {
      return;
    }


    try {

      const response =
        await addComment(
          postId,
          replyText.trim(),
          parentCommentId
        );


      if (!response?.comment) {

        console.error(
          "Server did not return reply:",
          response
        );

        throw new Error(
          "Server did not return the created reply"
        );

      }


      setComments((previous) => {

        const cleanComments =
          previous.filter(Boolean);


        const exists =
          cleanComments.some(
            (comment) =>
              comment?._id?.toString() ===
              response.comment?._id?.toString()
          );


        if (exists) {
          return cleanComments;
        }


        return [
          ...cleanComments,
          response.comment,
        ];

      });


      return response;

    } catch (error) {

      console.error(
        "Reply failed:",
        error
      );

      throw error;

    }

  };


  // =========================================
  // EDIT COMMENT / REPLY
  // =========================================

  const handleEdit = async (
    commentId,
    newText
  ) => {

    if (!commentId || !newText?.trim()) {
      return;
    }


    const response =
      await editComment(
        commentId,
        newText.trim()
      );


    if (!response?.comment) {
      throw new Error(
        "Updated comment was not returned"
      );
    }


    setComments((previous) => {

      return previous
        .filter(Boolean)
        .map((comment) =>
          comment?._id?.toString() ===
          commentId?.toString()
            ? response.comment
            : comment
        );

    });

  };


  // =========================================
  // DELETE COMMENT / REPLY
  // =========================================

  const handleDelete = async (
    commentId
  ) => {

    const previousComments =
      comments.filter(Boolean);


    // Optimistic delete
    setComments((previous) => {

      return previous
        .filter(Boolean)
        .filter((comment) => {

          if (
            comment?._id?.toString() ===
            commentId?.toString()
          ) {
            return false;
          }


          if (
            comment?.parentComment
              ?.toString() ===
            commentId?.toString()
          ) {
            return false;
          }


          return true;

        });

    });


    try {

      await deleteComment(
        commentId
      );

    } catch (error) {

      console.error(
        "Delete failed:",
        error
      );


      setComments(
        previousComments
      );

    }

  };


  // =========================================
  // CLEAN COMMENTS
  // =========================================

  const cleanComments =
    comments.filter(Boolean);


  // =========================================
  // MAIN COMMENTS
  // =========================================

  const mainComments =
    cleanComments.filter(
      (comment) =>
        !comment?.parentComment
    );


  // =========================================
  // GET REPLIES
  // =========================================

  const getReplies = (
    commentId
  ) => {

    return cleanComments.filter(
      (comment) =>
        comment?.parentComment
          ?.toString() ===
        commentId?.toString()
    );

  };


  // =========================================
  // UI
  // =========================================

  return (
    <div className="comment-section">

      <h4>
        Comments
      </h4>


      {/* =====================================
          COMMENTS LIST
      ===================================== */}

      {loading ? (

        <p className="comment-status">
          Loading comments...
        </p>

      ) : mainComments.length === 0 ? (

        <p className="comment-status">
          No comments yet.
        </p>

      ) : (

        <div className="comments-list">

          {mainComments.map(
            (comment) => (

              <CommentItem
                key={comment._id}
                comment={comment}
                replies={getReplies(
                  comment._id
                )}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

            )
          )}

        </div>

      )}


      {/* =====================================
          MAIN COMMENT FORM
      ===================================== */}

      <form
        className="comment-form"
        onSubmit={handleSubmit}
      >

        <img
          src={getImageUrl(
            user?.profileImage
          )}
          alt=""
          className="comment-input-avatar"
          onError={(e) => {
            e.currentTarget.src =
              "/default-avatar.png";
          }}
        />


        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />


        <button type="submit">
          Post
        </button>

      </form>

    </div>
  );
};

export default CommentSection;