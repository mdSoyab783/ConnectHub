import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import NotificationDropdown from "./NotificationDropdown";
import { useSocket } from "../../context/SocketContext";

const NotificationBell = () => {
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ==========================
  // Load Notifications
  // ==========================
  const loadNotifications = async () => {
    try {
      const response =
        await notificationService.getNotifications();

      setNotifications(response.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  // Initial Load
  useEffect(() => {
    loadNotifications();
  }, []);

  // ==========================
  // Real-time Notifications
  // ==========================
  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (notification) => {
      console.log("🔔 New Notification:", notification);

      setNotifications((prev) => [
        notification,
        ...prev,
      ]);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <button
        className="notification-btn"
        onClick={() =>
          setShowDropdown(!showDropdown)
        }
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </div>
  );
};

export default NotificationBell;