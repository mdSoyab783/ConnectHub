import notificationService from "../../services/notificationService";
import { formatDistanceToNow } from "date-fns";
import Avatar from "../common/Avatar";
import "../../styles/notification.css";
const NotificationDropdown = ({
  notifications,
  setNotifications,
}) => {

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
      console.log(error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "follow":
        return "👤";

      case "like":
        return "❤️";

      case "comment":
        return "💬";

      default:
        return "🔔";
    }
  };

  const getMessage = (type) => {
    switch (type) {
      case "follow":
        return "started following you";

      case "like":
        return "liked your post";

      case "comment":
        return "commented on your post";

      default:
        return "";
    }
  };

  return (
    <div className="notification-dropdown">

      <div className="notification-header">

        <h3>🔔 Notifications</h3>

        {notifications.length > 0 && (
          <button
            className="mark-read-btn"
            onClick={markAllRead}
          >
            Mark all read
          </button>
        )}

      </div>

      {notifications.length === 0 ? (

        <div className="empty-notifications">
          <h4>No notifications yet</h4>
          <p>You're all caught up 🎉</p>
        </div>

      ) : (

        <div className="notification-list">

          {notifications.map((notification) => (

            <div
              key={notification._id}
              className={`notification-card ${
                !notification.isRead ? "unread" : ""
              }`}
            >

              <Avatar
                src={notification.sender?.profileImage}
                alt={notification.sender?.username}
                size={45}
              />

              <div className="notification-content">

                <div>

                  <strong>
                    {notification.sender?.username}
                  </strong>{" "}

                  {getIcon(notification.type)}{" "}

                  {getMessage(notification.type)}

                </div>

                <small>
                  {formatDistanceToNow(
                    new Date(notification.createdAt),
                    {
                      addSuffix: true,
                    }
                  )}
                </small>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default NotificationDropdown;