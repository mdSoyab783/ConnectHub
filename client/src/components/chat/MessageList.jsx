import {
  useEffect,
  useState,
} from "react";

import {
  getMessages,
  markMessagesSeen,
  deleteMessage,
  editMessage,
  reactToMessage,
  forwardMessage,
} from "../../services/messageService";

import {
  getConversations,
} from "../../services/conversationService";

import {
  useSocket,
} from "../../context/SocketContext";

import {
  useAuth,
} from "../../context/AuthContext";

import Avatar from "../common/Avatar";


const MessageList = ({
  conversation,
  onReplyMessage,
}) => {

  const {
    socket,
  } = useSocket();

  const {
    user,
  } = useAuth();


  /* =====================================================
     STATES
  ===================================================== */

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    menuMessageId,
    setMenuMessageId,
  ] = useState(null);

  const [
    deleteMessageId,
    setDeleteMessageId,
  ] = useState(null);

  const [
    editMessageId,
    setEditMessageId,
  ] = useState(null);

  const [
    editText,
    setEditText,
  ] = useState("");

  const [
    reactionMessageId,
    setReactionMessageId,
  ] = useState(null);

  /* =====================================================
     FORWARD STATES
  ===================================================== */

  const [
    forwardMessageData,
    setForwardMessageData,
  ] = useState(null);

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    selectedForwardConversation,
    setSelectedForwardConversation,
  ] = useState(null);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(false);

  const [
    forwarding,
    setForwarding,
  ] = useState(false);


  /* =====================================================
     LOAD MESSAGES
  ===================================================== */

  useEffect(() => {

    if (!conversation?._id) {
      return;
    }

    const loadMessages = async () => {

      try {

        const response =
          await getMessages(
            conversation._id
          );

        setMessages(
          response.messages || []
        );

        await markMessagesSeen(
          conversation._id
        );

      } catch (error) {

        console.log(
          "Message Error:",
          error
        );

      }

    };

    loadMessages();

  }, [
    conversation?._id,
  ]);


  /* =====================================================
     SOCKET EVENTS
  ===================================================== */

  useEffect(() => {

    if (
      !socket ||
      !conversation?._id
    ) {
      return;
    }


    /* ==============================
       RECEIVE MESSAGE
    ============================== */

    const handleReceiveMessage =
      (message) => {

        if (
          message.conversation
            ?.toString() !==
          conversation._id.toString()
        ) {
          return;
        }

        setMessages(
          (prev) => {

            const exists =
              prev.some(
                (item) =>
                  item._id
                    ?.toString() ===
                  message._id
                    ?.toString()
              );

            if (exists) {
              return prev;
            }

            return [
              ...prev,
              message,
            ];

          }
        );

      };


    /* ==============================
       DELIVERED
    ============================== */

    const handleMessageDelivered =
      ({
        messageId,
      }) => {

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message._id
                  ?.toString() ===
                messageId
                  ?.toString()
                  ? {
                      ...message,
                      delivered: true,
                    }
                  : message
            )
        );

      };


    /* ==============================
       SEEN
    ============================== */

    const handleMessageSeen =
      ({
        messageId,
      }) => {

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message._id
                  ?.toString() ===
                messageId
                  ?.toString()
                  ? {
                      ...message,
                      seen: true,
                      isRead: true,
                    }
                  : message
            )
        );

      };


    /* ==============================
       DELETE
    ============================== */

    const handleMessageDeleted =
      ({
        messageId,
        conversationId,
      }) => {

        if (
          conversationId
            ?.toString() !==
          conversation._id.toString()
        ) {
          return;
        }

        setMessages(
          (prev) =>
            prev.filter(
              (message) =>
                message._id
                  ?.toString() !==
                messageId
                  ?.toString()
            )
        );

      };


    /* ==============================
       EDIT
    ============================== */

    const handleMessageEdited =
      ({
        message,
      }) => {

        if (!message) {
          return;
        }

        if (
          message.conversation
            ?.toString() !==
          conversation._id.toString()
        ) {
          return;
        }

        setMessages(
          (prev) =>
            prev.map(
              (item) =>
                item._id
                  ?.toString() ===
                message._id
                  ?.toString()
                  ? message
                  : item
            )
        );

      };


    /* ==============================
       REACTION
    ============================== */

    const handleMessageReaction =
      ({
        messageId,
        conversationId,
        reactions,
      }) => {

        if (
          conversationId
            ?.toString() !==
          conversation._id.toString()
        ) {
          return;
        }

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message._id
                  ?.toString() ===
                messageId
                  ?.toString()
                  ? {
                      ...message,
                      reactions,
                    }
                  : message
            )
        );

      };


    /* ==============================
       SOCKET LISTENERS
    ============================== */

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    socket.on(
      "messageDelivered",
      handleMessageDelivered
    );

    socket.on(
      "messageSeen",
      handleMessageSeen
    );

    socket.on(
      "messageDeleted",
      handleMessageDeleted
    );

    socket.on(
      "messageEdited",
      handleMessageEdited
    );

    socket.on(
      "messageReaction",
      handleMessageReaction
    );


    /* ==============================
       CLEANUP
    ============================== */

    return () => {

      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );

      socket.off(
        "messageDelivered",
        handleMessageDelivered
      );

      socket.off(
        "messageSeen",
        handleMessageSeen
      );

      socket.off(
        "messageDeleted",
        handleMessageDeleted
      );

      socket.off(
        "messageEdited",
        handleMessageEdited
      );

      socket.off(
        "messageReaction",
        handleMessageReaction
      );

    };

  }, [
    socket,
    conversation?._id,
  ]);


  /* =====================================================
     DELETE MESSAGE
  ===================================================== */

  const handleDeleteMessage =
    async (messageId) => {

      try {

        await deleteMessage(
          messageId
        );

        setMessages(
          (prev) =>
            prev.filter(
              (message) =>
                message._id
                  ?.toString() !==
                messageId
                  ?.toString()
            )
        );

        setMenuMessageId(null);

        setDeleteMessageId(null);

      } catch (error) {

        console.log(
          "Delete Message Error:",
          error
        );

      }

    };


  /* =====================================================
     START EDIT
  ===================================================== */

  const handleStartEdit =
    (message) => {

      setEditMessageId(
        message._id
      );

      setEditText(
        message.text || ""
      );

      setMenuMessageId(null);

      setReactionMessageId(null);

    };


  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const handleCancelEdit =
    () => {

      setEditMessageId(null);

      setEditText("");

    };


  /* =====================================================
     SAVE EDIT
  ===================================================== */

  const handleSaveEdit =
    async (messageId) => {

      if (!editText.trim()) {
        return;
      }

      try {

        const response =
          await editMessage(
            messageId,
            editText.trim()
          );

        const updatedMessage =
          response.message;

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message._id
                  ?.toString() ===
                messageId
                  ?.toString()
                  ? updatedMessage
                  : message
            )
        );

        setEditMessageId(null);

        setEditText("");

      } catch (error) {

        console.log(
          "Edit Message Error:",
          error
        );

      }

    };


  /* =====================================================
     MESSAGE REACTION
  ===================================================== */

  const handleReaction =
    async (
      messageId,
      emoji
    ) => {

      try {

        const response =
          await reactToMessage(
            messageId,
            emoji
          );

        const updatedMessage =
          response.message;

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message._id
                  ?.toString() ===
                messageId
                  ?.toString()
                  ? updatedMessage
                  : message
            )
        );

        setReactionMessageId(null);

        setMenuMessageId(null);

      } catch (error) {

        console.log(
          "Reaction Error:",
          error
        );

      }

    };


  /* =====================================================
     OPEN FORWARD
  ===================================================== */

  const handleOpenForward =
    async (message) => {

      setForwardMessageData(
        message
      );

      setSelectedForwardConversation(
        null
      );

      setMenuMessageId(null);

      setReactionMessageId(null);

      setLoadingConversations(true);

      try {

        const response =
          await getConversations();

        setConversations(
          response.conversations || []
        );

      } catch (error) {

        console.log(
          "Forward Conversations Error:",
          error
        );

        setConversations([]);

      } finally {

        setLoadingConversations(false);

      }

    };


  /* =====================================================
     CLOSE FORWARD
  ===================================================== */

  const handleCloseForward =
    () => {

      if (forwarding) {
        return;
      }

      setForwardMessageData(null);

      setSelectedForwardConversation(
        null
      );

      setConversations([]);

    };


  /* =====================================================
     FORWARD MESSAGE
  ===================================================== */

  const handleForward =
    async () => {

      if (
        !forwardMessageData ||
        !selectedForwardConversation
      ) {
        return;
      }

      try {

        setForwarding(true);

        await forwardMessage(
          forwardMessageData._id,
          selectedForwardConversation._id
        );

        setForwardMessageData(null);

        setSelectedForwardConversation(
          null
        );

        setConversations([]);

      } catch (error) {

        console.log(
          "Forward Message Error:",
          error
        );

      } finally {

        setForwarding(false);

      }

    };


  /* =====================================================
     OTHER USER
  ===================================================== */

  const otherUser =
    conversation?.participants?.find(
      (participant) =>
        (
          participant._id ||
          participant.id
        )?.toString() !==
        (
          user?._id ||
          user?.id
        )?.toString()
    );


  /* =====================================================
     EMPTY
  ===================================================== */

  if (!conversation) {

    return (
      <div className="message-list empty">
        Select a conversation
      </div>
    );

  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>

      <div className="message-list">

        {messages.map(
          (message) => {

            const senderId =
              message.sender?._id ||
              message.sender?.id ||
              message.sender;

            const currentUserId =
              user?._id ||
              user?.id;

            const isOwn =
              senderId?.toString() ===
              currentUserId?.toString();

            const isEditing =
              editMessageId ===
              message._id;


            return (

              <div
                key={
                  message._id
                }
                className={`message-row ${
                  isOwn
                    ? "message-own"
                    : "message-other"
                }`}
              >

                {/* =====================================
                    OTHER USER AVATAR
                ===================================== */}

                {!isOwn && (

                  <Avatar
                    src={
                      otherUser
                        ?.profileImage
                    }
                    alt={
                      otherUser
                        ?.fullName
                    }
                    size={34}
                  />

                )}


                {/* =====================================
                    MESSAGE BUBBLE
                ===================================== */}

                <div className="message-bubble">


                  {/* ==================================
                      EDIT MODE
                  ================================== */}

                  {isEditing ? (

                    <div className="edit-message-container">

                      <textarea
                        value={
                          editText
                        }
                        onChange={(
                          e
                        ) =>
                          setEditText(
                            e.target.value
                          )
                        }
                        autoFocus
                        className="edit-message-input"
                      />

                      <div className="edit-message-actions">

                        <button
                          type="button"
                          className="cancel-edit"
                          onClick={
                            handleCancelEdit
                          }
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="save-edit"
                          onClick={() =>
                            handleSaveEdit(
                              message._id
                            )
                          }
                        >
                          Save
                        </button>

                      </div>

                    </div>

                  ) : (

                    <>

                      {/* ==================================
                          MESSAGE MENU
                      ================================== */}

                      <div className="message-menu-container">

                        <button
                          type="button"
                          className="message-menu-button"
                          onClick={() => {

                            setMenuMessageId(
                              menuMessageId ===
                                message._id
                                ? null
                                : message._id
                            );

                            setReactionMessageId(
                              null
                            );

                          }}
                        >
                          ⋮
                        </button>


                        {menuMessageId ===
                          message._id && (

                          <div className="message-menu">

                            {/* ==============================
                                REACT
                            ============================== */}

                            <button
                              type="button"
                              className="react-menu-button"
                              onClick={() => {

                                setReactionMessageId(
                                  reactionMessageId ===
                                    message._id
                                    ? null
                                    : message._id
                                );

                              }}
                            >
                              😊 React
                            </button>


                            {reactionMessageId ===
                              message._id && (

                              <div className="reaction-picker">

                                {[
                                  "❤️",
                                  "😂",
                                  "👍",
                                  "😢",
                                  "😡",
                                ].map(
                                  (emoji) => (

                                    <button
                                      key={
                                        emoji
                                      }
                                      type="button"
                                      className="reaction-emoji-button"
                                      onClick={() => {

                                        handleReaction(
                                          message._id,
                                          emoji
                                        );

                                        setReactionMessageId(
                                          null
                                        );

                                        setMenuMessageId(
                                          null
                                        );

                                      }}
                                    >
                                      {emoji}
                                    </button>

                                  )
                                )}

                              </div>

                            )}


                            {/* ==============================
                                REPLY
                            ============================== */}

                            <button
                              type="button"
                              onClick={() => {

                                if (
                                  onReplyMessage
                                ) {
                                  onReplyMessage(
                                    message
                                  );
                                }

                                setMenuMessageId(
                                  null
                                );

                                setReactionMessageId(
                                  null
                                );

                              }}
                            >
                              ↩️ Reply
                            </button>


                            {/* ==============================
                                FORWARD
                            ============================== */}

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenForward(
                                  message
                                )
                              }
                            >
                              ↗️ Forward
                            </button>


                            {/* ==============================
                                EDIT
                                ONLY OWN MESSAGE
                            ============================== */}

                            {isOwn &&
                              message.text && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    message
                                  )
                                }
                              >
                                ✏️ Edit
                              </button>

                            )}


                            {/* ==============================
                                DELETE
                                ONLY OWN MESSAGE
                            ============================== */}

                            {isOwn && (

                              <button
                                type="button"
                                onClick={() => {

                                  setDeleteMessageId(
                                    message._id
                                  );

                                  setMenuMessageId(
                                    null
                                  );

                                  setReactionMessageId(
                                    null
                                  );

                                }}
                              >
                                🗑️ Delete
                              </button>

                            )}

                          </div>

                        )}

                      </div>


                      {/* ==================================
                          FORWARDED LABEL
                      ================================== */}

                      {message.forwarded && (

                        <div className="forwarded-label">
                          ↗️ Forwarded
                        </div>

                      )}


                      {/* ==================================
                          REPLY PREVIEW
                      ================================== */}

                      {message.replyPreview &&
                        (
                          message.replyPreview
                            .text ||
                          message.replyPreview
                            .image
                        ) && (

                        <div className="message-reply-preview">

                          <div className="reply-preview-sender">

                            {
                              message
                                .replyPreview
                                .senderName ||
                              "User"
                            }

                          </div>

                          <div className="reply-preview-content">

                            {message
                              .replyPreview
                              .image &&
                            !message
                              .replyPreview
                              .text
                              ? "📷 Photo"
                              : message
                                  .replyPreview
                                  .text}

                          </div>

                        </div>

                      )}


                      {/* ==================================
                          IMAGE
                      ================================== */}

                      {message.image && (

                        <img
                          src={`http://localhost:3000${message.image}`}
                          alt="message"
                          className="message-image"
                        />

                      )}


                      {/* ==================================
                          TEXT
                      ================================== */}

                      {message.text && (

                        <div className="message-text">

                          {
                            message.text
                          }

                        </div>

                      )}


                      {/* ==================================
                          REACTION DISPLAY
                      ================================== */}

                      {message.reactions &&
                        message.reactions.length >
                          0 && (

                        <div className="message-reactions">

                          {[
                            ...new Set(
                              message.reactions.map(
                                (reaction) =>
                                  reaction.emoji
                              )
                            ),
                          ].map(
                            (emoji) => {

                              const count =
                                message.reactions.filter(
                                  (
                                    reaction
                                  ) =>
                                    reaction.emoji ===
                                    emoji
                                ).length;


                              return (

                                <button
                                  key={
                                    emoji
                                  }
                                  type="button"
                                  className="reaction-badge"
                                  onClick={() =>
                                    handleReaction(
                                      message._id,
                                      emoji
                                    )
                                  }
                                >
                                  {emoji}{" "}
                                  {count}
                                </button>

                              );

                            }
                          )}

                        </div>

                      )}


                      {/* ==================================
                          MESSAGE META
                      ================================== */}

                      <div className="message-meta">

                        <span>

                          {new Date(
                            message.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",

                              minute:
                                "2-digit",
                            }
                          )}

                        </span>


                        {message.edited && (

                          <span className="edited-label">
                            edited
                          </span>

                        )}


                        {isOwn && (

                          <span className="message-status">

                            {message.seen
                              ? "✓✓"
                              : message.delivered
                              ? "✓✓"
                              : "✓"}

                          </span>

                        )}

                      </div>

                    </>

                  )}

                </div>


                {/* =====================================
                    OWN USER AVATAR
                ===================================== */}

                {isOwn && (

                  <Avatar
                    src={
                      user?.profileImage
                    }
                    alt={
                      user?.fullName
                    }
                    size={34}
                  />

                )}

              </div>

            );

          }
        )}

      </div>


      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

      {deleteMessageId && (

        <div className="delete-overlay">

          <div className="delete-dialog">

            <h3>
              Delete message?
            </h3>

            <p>
              This message will be
              deleted for everyone.
            </p>

            <div className="delete-actions">

              <button
                className="cancel-delete"
                onClick={() =>
                  setDeleteMessageId(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={() =>
                  handleDeleteMessage(
                    deleteMessageId
                  )
                }
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          FORWARD MESSAGE MODAL
      ================================================= */}

      {forwardMessageData && (

        <div
          className="forward-overlay"
          onClick={
            handleCloseForward
          }
        >

          <div
            className="forward-dialog"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="forward-header">

              <h3>
                Forward message
              </h3>

              <button
                type="button"
                className="forward-close-button"
                onClick={
                  handleCloseForward
                }
              >
                ×
              </button>

            </div>


            {/* ==========================================
                MESSAGE PREVIEW
            ========================================== */}

            <div className="forward-message-preview">

              <div className="forward-preview-label">
                Message
              </div>

              {forwardMessageData.image && (

                <img
                  src={`http://localhost:3000${forwardMessageData.image}`}
                  alt="Forward preview"
                  className="forward-preview-image"
                />

              )}

              {forwardMessageData.text && (

                <div className="forward-preview-text">
                  {forwardMessageData.text}
                </div>

              )}

            </div>


            {/* ==========================================
                CONVERSATIONS
            ========================================== */}

            <div className="forward-conversation-title">
              Send to
            </div>


            {loadingConversations ? (

              <div className="forward-loading">
                Loading conversations...
              </div>

            ) : conversations.length === 0 ? (

              <div className="forward-empty">
                No conversations found.
              </div>

            ) : (

              <div className="forward-conversation-list">

                {conversations.map(
                  (item) => {

                    const participants =
                      item.participants ||
                      [];

                    const otherParticipant =
                      participants.find(
                        (participant) =>
                          (
                            participant._id ||
                            participant.id
                          )?.toString() !==
                          (
                            user?._id ||
                            user?.id
                          )?.toString()
                      );


                    const participantName =
                      otherParticipant
                        ?.fullName ||
                      otherParticipant
                        ?.username ||
                      "User";


                    const participantImage =
                      otherParticipant
                        ?.profileImage ||
                      "";


                    const isSelected =
                      selectedForwardConversation
                        ?._id
                          ?.toString() ===
                      item._id
                        ?.toString();


                    return (

                      <button
                        key={
                          item._id
                        }
                        type="button"
                        className={`forward-conversation-item ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedForwardConversation(
                            item
                          )
                        }
                      >

                        <Avatar
                          src={
                            participantImage
                          }
                          alt={
                            participantName
                          }
                          size={42}
                        />

                        <div className="forward-conversation-info">

                          <div className="forward-conversation-name">
                            {participantName}
                          </div>

                          <div className="forward-conversation-subtitle">
                            Conversation
                          </div>

                        </div>

                        {isSelected && (

                          <span className="forward-selected-check">
                            ✓
                          </span>

                        )}

                      </button>

                    );

                  }
                )}

              </div>

            )}


            {/* ==========================================
                ACTIONS
            ========================================== */}

            <div className="forward-actions">

              <button
                type="button"
                className="forward-cancel-button"
                onClick={
                  handleCloseForward
                }
                disabled={forwarding}
              >
                Cancel
              </button>

              <button
                type="button"
                className="forward-confirm-button"
                onClick={
                  handleForward
                }
                disabled={
                  !selectedForwardConversation ||
                  forwarding
                }
              >
                {forwarding
                  ? "Forwarding..."
                  : "Forward"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};


export default MessageList;