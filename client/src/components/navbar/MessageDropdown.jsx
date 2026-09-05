import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getConversations } from "../../services/conversationService";
import { getUnreadCounts } from "../../services/messageService";

import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

const MessageDropdown = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { socket } = useSocket();

  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  // ==========================
  // Load Conversations
  // ==========================
  const loadConversations = useCallback(async () => {
    try {
      const response = await getConversations();

      setConversations(response.conversations || []);
    } catch (error) {
      console.log("Conversation Error:", error);
    }
  }, []);

  // ==========================
  // Load Unread Counts
  // ==========================
  const loadUnreadCounts = useCallback(async () => {
    try {
      const response = await getUnreadCounts();

      const counts = {};

      (response.unread || []).forEach((item) => {
        counts[item._id] = item.count;
      });

      setUnreadCounts(counts);
    } catch (error) {
      console.log("Unread Error:", error);
    }
  }, []);

  // ==========================
  // Initial Load
  // ==========================
  useEffect(() => {
    loadConversations();
    loadUnreadCounts();
  }, [loadConversations, loadUnreadCounts]);

  // ==========================
  // Real-Time New Message
  // ==========================
  useEffect(() => {
    if (!socket) return;

    const handleNewUnreadMessage = ({ conversationId }) => {
      /*
        Check whether this conversation is currently open.

        Example:
        /chat/123456
      */

      const currentConversationId =
        location.pathname.startsWith("/chat/")
          ? location.pathname.split("/chat/")[1]
          : null;

      // If this chat is currently open,
      // don't increase unread count.
      if (currentConversationId === conversationId) {
        loadConversations();
        return;
      }

      // Increase unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]:
          (prev[conversationId] || 0) + 1,
      }));

      // Reload conversations so latest message
      // and timestamp are updated.
      loadConversations();
    };

    socket.on(
      "newUnreadMessage",
      handleNewUnreadMessage
    );

    return () => {
      socket.off(
        "newUnreadMessage",
        handleNewUnreadMessage
      );
    };
  }, [socket, location.pathname, loadConversations]);

  // ==========================
  // Total Unread
  // ==========================
  const totalUnread = Object.values(unreadCounts).reduce(
    (total, count) => total + count,
    0
  );

  // ==========================
  // Get Other User
  // ==========================
  const getOtherUser = (conversation) => {
    return conversation.participants?.find(
      (participant) =>
        (participant._id || participant.id) !==
        (user?._id || user?.id)
    );
  };

  // ==========================
  // Open Conversation
  // ==========================
  const openConversation = (conversation) => {
    // Clear unread count immediately
    setUnreadCounts((prev) => ({
      ...prev,
      [conversation._id]: 0,
    }));

    // Close dropdown
    setOpen(false);

    // Open conversation
    navigate(`/chat/${conversation._id}`);
  };

  // ==========================
  // Toggle Dropdown
  // ==========================
  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="message-dropdown-container">

      {/* ==========================
          Messenger Button
      ========================== */}
      <button
        className="message-button"
        onClick={toggleDropdown}
        title="Messages"
      >
        💬

        {totalUnread > 0 && (
          <span className="message-badge">
            {totalUnread > 99
              ? "99+"
              : totalUnread}
          </span>
        )}
      </button>

      {/* ==========================
          Dropdown
      ========================== */}
      {open && (
        <div className="message-dropdown">

          {/* Header */}
          <div className="message-dropdown-header">
            <h3>Messages</h3>
          </div>

          {/* Conversations */}
          {conversations.length === 0 ? (
            <div className="no-messages">
              No conversations yet.
            </div>
          ) : (
            <div className="message-dropdown-list">

              {conversations
                .slice(0, 5)
                .map((conversation) => {
                  const otherUser =
                    getOtherUser(conversation);

                  const unread =
                    unreadCounts[
                      conversation._id
                    ] || 0;

                  const lastMessage =
                    conversation.lastMessage;

                  return (
                    <div
                      key={conversation._id}
                      className={`message-dropdown-item ${
                        unread > 0
                          ? "message-dropdown-unread"
                          : ""
                      }`}
                      onClick={() =>
                        openConversation(
                          conversation
                        )
                      }
                    >

                      {/* Avatar */}
                      <Avatar
                        src={
                          otherUser?.profileImage
                        }
                        alt={
                          otherUser?.fullName
                        }
                        size={42}
                      />

                      {/* Content */}
                      <div className="message-dropdown-content">

                        {/* Name + unread */}
                        <div className="message-dropdown-name">

                          <span>
                            {otherUser?.fullName ||
                              "User"}
                          </span>

                          {unread > 0 && (
                            <span className="small-unread-badge">
                              {unread > 99
                                ? "99+"
                                : unread}
                            </span>
                          )}

                        </div>

                        {/* Last Message */}
                        <div className="message-dropdown-preview">

                          {lastMessage?.image &&
                          !lastMessage?.text
                            ? "📷 Photo"
                            : lastMessage?.text ||
                              "No messages yet."}

                        </div>

                      </div>
                    </div>
                  );
                })}

            </div>
          )}

          {/* ==========================
              See All Messages
          ========================== */}
          <button
            className="see-all-messages"
            onClick={() => {
              setOpen(false);
              navigate("/chat");
            }}
          >
            See all messages
          </button>

        </div>
      )}
    </div>
  );
};

export default MessageDropdown;