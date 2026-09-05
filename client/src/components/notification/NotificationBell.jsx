import { useEffect, useState } from "react";

import notificationService from "../../services/notificationService";
import NotificationDropdown from "./NotificationDropdown";

import { useSocket } from "../../context/SocketContext";


const NotificationBell = () => {
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications = async () => {
    try {
      const response =
        await notificationService.getNotifications();

      setNotifications(
        response.notifications || []
      );
    } catch (error) {
      console.log(
        "Notification loading error:",
        error
      );
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================================
  // REAL-TIME NOTIFICATIONS
  // =========================================

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (
      notification
    ) => {
      setNotifications((prev) => {

        // Prevent duplicate notification
        const alreadyExists = prev.some(
          (item) =>
            item._id === notification._id
        );

        if (alreadyExists) {
          return prev;
        }

        return [
          notification,
          ...prev,
        ];
      });
    };

    socket.on(
      "newNotification",
      handleNewNotification
    );

    return () => {
      socket.off(
        "newNotification",
        handleNewNotification
      );
    };
  }, [socket]);

  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // =========================================
  // TOGGLE DROPDOWN
  // =========================================

  const handleToggle = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="notification-container">

      <button
        type="button"
        className={`notification-btn ${
          showDropdown
            ? "notification-btn-active"
            : ""
        }`}
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={showDropdown}
      >

        <span className="notification-icon">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="notification-badge">

            {unreadCount > 99
              ? "99+"
              : unreadCount}

          </span>
        )}

      </button>


      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
          closeDropdown={() =>
            setShowDropdown(false)
          }
        />
      )}

    </div>
  );
};

export default NotificationBell;