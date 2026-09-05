import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FaHome,
  FaUserFriends,
  FaChartBar,
  FaBookmark,
  FaHistory,
  FaUsers,
  FaPlayCircle,
  FaStore,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
  FaComments,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "../../styles/sidebar.css";

const Sidebar = ({ closeSidebar }) => {
  const { user, logout } = useAuth();

  const [showMore, setShowMore] = useState(false);

  const handleClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    if (closeSidebar) {
      closeSidebar();
    }

    logout();
  };

  return (
    <div className="sidebar">

      {/* =========================================
          PROFILE
      ========================================= */}

      <Link
        to="/profile"
        className="sidebar-profile"
        onClick={handleClick}
      >

        <div className="sidebar-profile-avatar">

          {user?.profileImage ? (
            <img
              src={`http://localhost:3000${user.profileImage}`}
              alt={user?.fullName || "User"}
            />
          ) : (
            <span>
              {user?.fullName
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </span>
          )}

        </div>

        <span className="sidebar-profile-name">
          {user?.fullName || "User"}
        </span>

      </Link>


      {/* =========================================
          MENU
      ========================================= */}

      <div className="sidebar-menu">

        {/* AI */}

        <button
          type="button"
          className="sidebar-item"
        >
          <span className="sidebar-item-icon ai-icon">
            <FaRobot />
          </span>

          <span className="sidebar-item-text">
            ConnectHub AI
          </span>
        </button>


        {/* FRIENDS */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon friends-icon">
            <FaUserFriends />
          </span>

          <span className="sidebar-item-text">
            Friends
          </span>
        </Link>


        {/* DASHBOARD */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon dashboard-icon">
            <FaChartBar />
          </span>

          <span className="sidebar-item-text">
            Dashboard
          </span>
        </Link>


        {/* SAVED */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon saved-icon">
            <FaBookmark />
          </span>

          <span className="sidebar-item-text">
            Saved
          </span>
        </Link>


        {/* MEMORIES */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon memories-icon">
            <FaHistory />
          </span>

          <span className="sidebar-item-text">
            Memories
          </span>
        </Link>


        {/* GROUPS */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon groups-icon">
            <FaUsers />
          </span>

          <span className="sidebar-item-text">
            Groups
          </span>
        </Link>


        {/* REELS */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon reels-icon">
            <FaPlayCircle />
          </span>

          <span className="sidebar-item-text">
            Reels
          </span>
        </Link>


        {/* MARKETPLACE */}

        <Link
          to="/"
          className="sidebar-item"
          onClick={handleClick}
        >
          <span className="sidebar-item-icon marketplace-icon">
            <FaStore />
          </span>

          <span className="sidebar-item-text">
            Marketplace
          </span>
        </Link>


        {/* =====================================
            SEE MORE
        ===================================== */}

        <button
          type="button"
          className="sidebar-item see-more-item"
          onClick={() =>
            setShowMore((prev) => !prev)
          }
        >

          <span className="sidebar-item-icon see-more-icon">

            {showMore ? (
              <FaChevronUp />
            ) : (
              <FaChevronDown />
            )}

          </span>

          <span className="sidebar-item-text">
            {showMore
              ? "See less"
              : "See more"}
          </span>

        </button>


        {/* =====================================
            MORE OPTIONS
        ===================================== */}

        {showMore && (
          <div className="sidebar-more-options">

            <Link
              to="/"
              className="sidebar-item"
              onClick={handleClick}
            >
              <span className="sidebar-item-icon">
                <FaHome />
              </span>

              <span className="sidebar-item-text">
                Home
              </span>
            </Link>


            <Link
              to="/chat"
              className="sidebar-item"
              onClick={handleClick}
            >
              <span className="sidebar-item-icon">
                <FaComments />
              </span>

              <span className="sidebar-item-text">
                Messages
              </span>
            </Link>


            <Link
              to="/"
              className="sidebar-item"
              onClick={handleClick}
            >
              <span className="sidebar-item-icon">
                <FaBell />
              </span>

              <span className="sidebar-item-text">
                Notifications
              </span>
            </Link>


            <Link
              to="/profile"
              className="sidebar-item"
              onClick={handleClick}
            >
              <span className="sidebar-item-icon">
                <FaCog />
              </span>

              <span className="sidebar-item-text">
                Settings
              </span>
            </Link>


            <button
              type="button"
              className="sidebar-item sidebar-logout"
              onClick={handleLogout}
            >
              <span className="sidebar-item-icon">
                <FaSignOutAlt />
              </span>

              <span className="sidebar-item-text">
                Logout
              </span>
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default Sidebar;