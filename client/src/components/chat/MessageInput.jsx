import {
  useRef,
  useState,
} from "react";

import {
  sendMessage,
} from "../../services/messageService";

import {
  useSocket,
} from "../../context/SocketContext";

import {
  useAuth,
} from "../../context/AuthContext";


const MessageInput = ({
  conversation,
  onMessageSent,
  replyMessage,
  onCancelReply,
}) => {

  const [
    text,
    setText,
  ] = useState("");


  const [
    image,
    setImage,
  ] = useState(null);


  const [
    imagePreview,
    setImagePreview,
  ] = useState(null);


  const {
    socket,
  } = useSocket();


  const {
    user,
  } = useAuth();


  const typingTimeout =
    useRef(null);


  /* =====================================================
     TYPING
  ===================================================== */

  const handleTyping = (e) => {

    const value =
      e.target.value;

    setText(value);


    if (
      !conversation ||
      !socket
    ) {
      return;
    }


    socket.emit(
      "typing",
      {
        conversationId:
          conversation._id,

        user: {
          _id:
            user?._id ||
            user?.id,

          username:
            user?.username,
        },
      }
    );


    clearTimeout(
      typingTimeout.current
    );


    typingTimeout.current =
      setTimeout(() => {

        socket.emit(
          "stopTyping",
          {
            conversationId:
              conversation._id,
          }
        );

      }, 1000);
  };


  /* =====================================================
     IMAGE SELECT
  ===================================================== */

  const handleImageChange = (e) => {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Image must be less than 10MB."
      );

      return;
    }


    setImage(file);


    setImagePreview(
      URL.createObjectURL(
        file
      )
    );
  };


  /* =====================================================
     REMOVE IMAGE
  ===================================================== */

  const handleRemoveImage = () => {

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }


    setImage(null);

    setImagePreview(null);


    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };


  /* =====================================================
     FILE INPUT
  ===================================================== */

  const fileInputRef =
    useRef(null);


  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const handleSend = async (e) => {

    e.preventDefault();


    if (!conversation) {
      return;
    }


    if (
      !text.trim() &&
      !image
    ) {
      return;
    }


    try {

      /*
       * Send message
       *
       * replyMessage._id is sent
       * when this is a reply.
       */

      const response =
        await sendMessage(
          conversation._id,
          text,
          image,
          replyMessage?._id ||
            null
        );


      const savedMessage =
        response.message;


      /* ==========================================
         SOCKET
      ========================================== */

      if (socket) {

        socket.emit(
          "sendMessage",
          savedMessage
        );


        socket.emit(
          "stopTyping",
          {
            conversationId:
              conversation._id,
          }
        );
      }


      /* ==========================================
         CLEAR INPUT
      ========================================== */

      setText("");


      handleRemoveImage();


      /* ==========================================
         CLEAR REPLY
      ========================================== */

      if (
        onCancelReply
      ) {
        onCancelReply();
      }


      /* ==========================================
         UPDATE CONVERSATION
      ========================================== */

      if (
        onMessageSent
      ) {
        onMessageSent(
          savedMessage
        );
      }

    } catch (error) {

      console.log(
        "Send Message Error:",
        error
      );
    }
  };


  return (
    <div className="message-input">

      {/* ==========================================
          REPLY PREVIEW
      ========================================== */}

      {replyMessage && (

        <div className="reply-preview">

          <div className="reply-preview-content">

            <div className="reply-preview-title">

              Replying to{" "}

              <strong>
                {replyMessage
                  .sender
                  ?.fullName ||
                  replyMessage
                    .sender
                    ?.username ||
                  "User"}
              </strong>

            </div>


            <div className="reply-preview-text">

              {replyMessage.image &&
              !replyMessage.text
                ? "📷 Photo"
                : replyMessage.text}

            </div>

          </div>


          <button
            type="button"
            className="cancel-reply"
            onClick={
              onCancelReply
            }
          >
            ✕
          </button>

        </div>
      )}


      {/* ==========================================
          IMAGE PREVIEW
      ========================================== */}

      {imagePreview && (

        <div className="message-image-preview">

          <img
            src={imagePreview}
            alt="Preview"
          />


          <button
            type="button"
            className="remove-image"
            onClick={
              handleRemoveImage
            }
          >
            ✕
          </button>

        </div>
      )}


      {/* ==========================================
          INPUT ROW
      ========================================== */}

      <form
        onSubmit={handleSend}
        className="message-input-row"
      >

        {/* IMAGE BUTTON */}

        <button
          type="button"
          className="image-button"
          onClick={() =>
            fileInputRef.current?.click()
          }
        >
          📷
        </button>


        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={
            handleImageChange
          }
          style={{
            display: "none",
          }}
        />


        {/* TEXT INPUT */}

        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={
            handleTyping
          }
        />


        {/* SEND BUTTON */}

        <button
          type="submit"
        >
          Send
        </button>

      </form>

    </div>
  );
};


export default MessageInput;