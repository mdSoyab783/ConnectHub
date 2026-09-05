import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import notificationService from "../../services/notificationService";
import Avatar from "../common/Avatar";

import "../../styles/notification.css";

const NotificationDropdown = ({
  notifications,
  setNotifications,
  closeDropdown,
}) => {
  const navigate = useNavigate();

  // ======================================
  // MARK ALL AS READ
  // ======================================

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.log(
        "Mark all notifications read error:",
        error
      );
    }
  };

  // ======================================
  // NOTIFICATION ICON
  // ======================================

  const getIcon = (type) => {
    switch (type) {
      case "follow":
        return "👤";

      case "like":
        return "❤️";

      case "comment":
        return "💬";

      case "message":
        return "✉️";

      default:
        return "🔔";
    }
  };

  // ======================================
  // NOTIFICATION TEXT
  // ======================================

  const getMessage = (type) => {
    switch (type) {
      case "follow":
        return "started following you";

      case "like":
        return "liked your post";

      case "comment":
        return "commented on your post";

      case "message":
        return "sent you a message";

      default:
        return "sent you a notification";
    }
  };

  // ======================================
  // HANDLE NOTIFICATION CLICK
  // ======================================

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      // Mark selected notification as read
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      // Close dropdown
      if (closeDropdown) {
        closeDropdown();
      }

      // Navigate
      switch (notification.type) {
        case "message":
          if (notification.conversation) {
            navigate(
              `/chat/${notification.conversation}`
            );
          }
          break;

        case "follow":
          if (notification.sender?._id) {
            navigate(
              `/users/${notification.sender._id}`
            );
          }
          break;

        case "like":
        case "comment":
          if (notification.post) {
            navigate(
              `/posts/${notification.post}`
            );
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(
        "Notification click error:",
        error
      );
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div
      className="notification-dropdown"
      role="dialog"
      aria-label="Notifications"
    >

      {/* HEADER */}

      <div className="notification-header">

        <div className="notification-title-area">

          <div className="notification-title-icon">
            🔔
          </div>

          <div>
            <h3>Notifications</h3>

            {notifications.length > 0 && (
              <span className="notification-subtitle">
                {notifications.length}{" "}
                {notifications.length === 1
                  ? "notification"
                  : "notifications"}
              </span>
            )}

          </div>

        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            className="mark-read-btn"
            onClick={markAllRead}
          >
            Mark all read
          </button>
        )}

      </div>


      {/* EMPTY STATE */}

      {notifications.length === 0 ? (

        <div className="empty-notifications">

          <div className="empty-notification-icon">
            🔔
          </div>

          <h4>You're all caught up!</h4>

          <p>
            No new notifications right now.
          </p>

        </div>

      ) : (

        /* NOTIFICATION LIST */

        <div className="notification-list">

          {notifications.map(
            (notification) => {

              const isUnread =
                !notification.isRead;

              return (
                <div
                  key={notification._id}
                  className={`notification-card ${
                    isUnread
                      ? "unread"
                      : ""
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      handleNotificationClick(
                        notification
                      );
                    }
                  }}
                >

                  {/* AVATAR */}

                  <div className="notification-avatar-wrapper">

                    <Avatar
                      src={
                        notification
                          .sender
                          ?.profileImage
                      }
                      alt={
                        notification
                          .sender
                          ?.username ||
                        "User"
                      }
                      size={45}
                    />

                    <span className="notification-type-icon">
                      {getIcon(
                        notification.type
                      )}
                    </span>

                  </div>


                  {/* CONTENT */}

                  <div className="notification-content">

                    <p className="notification-message">

                      <strong>
                        {
                          notification
                            .sender
                            ?.username
                        }
                      </strong>

                      <span className="notification-action">
                        {" "}
                        {getMessage(
                          notification.type
                        )}
                      </span>

                    </p>

                    <small>
                      {formatDistanceToNow(
                        new Date(
                          notification.createdAt
                        ),
                        {
                          addSuffix: true,
                        }
                      )}
                    </small>

                  </div>


                  {/* UNREAD DOT */}

                  {isUnread && (
                    <span
                      className="notification-unread-dot"
                      aria-label="Unread"
                    ></span>
                  )}

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
};

export default NotificationDropdown;