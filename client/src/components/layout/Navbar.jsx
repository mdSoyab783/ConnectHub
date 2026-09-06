import { Link } from "react-router-dom";
import { useState } from "react";
import { getImageUrl } from "../../utils/image";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notification/NotificationBell";
import SearchBar from "../search/SearchBar";

import "../../styles/navbar.css";

const Navbar = ({
  onMenuClick,
  menuOpen,
}) => {
  const { user, logout } = useAuth();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const handleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <nav className="navbar">

      {/* =========================================
          LEFT SIDE
      ========================================= */}

      <div className="navbar-left">

        <Link
          to="/"
          className="navbar-logo"
        >
          ConnectHub
        </Link>

      </div>


      {/* =========================================
          SEARCH
      ========================================= */}

      <div className="navbar-search">
        <SearchBar />
      </div>


      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="nav-right">


        {/* =====================================
            HOME
        ===================================== */}

        <Link
          to="/"
          className="navbar-circle-button"
          title="Home"
          aria-label="Home"
        >
          <span className="navbar-home-icon">
            🏠
          </span>
        </Link>


        {/* =====================================
            MESSENGER
        ===================================== */}

        <Link
          to="/chat"
          className="navbar-circle-button"
          title="Messages"
          aria-label="Messages"
        >
          <span className="navbar-messenger-icon">
            💬
          </span>
        </Link>


        {/* =====================================
            NOTIFICATIONS
        ===================================== */}

        <div className="navbar-notification">
          <NotificationBell />
        </div>


        {/* =====================================
            PROFILE
        ===================================== */}

        <div className="navbar-profile-wrapper">

          <button
            type="button"
            className={`navbar-profile-button ${
              showProfileMenu
                ? "navbar-profile-button-active"
                : ""
            }`}
            onClick={handleProfileMenu}
            aria-label="Profile menu"
            aria-expanded={showProfileMenu}
          >

            <div className="navbar-profile-avatar">

              {user?.profileImage ? (
                <img
  src={getImageUrl(user.profileImage)}
  alt={user?.fullName || "User"}
/>
              ) : (
                <span>
                  {
                    user?.fullName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "U"
                  }
                </span>
              )}

            </div>


            <span className="navbar-profile-arrow">
              {showProfileMenu ? "⌃" : "⌄"}
            </span>

          </button>


          {/* ===================================
              PROFILE DROPDOWN
          =================================== */}

          {showProfileMenu && (
            <div className="navbar-profile-menu">

              <Link
                to="/profile"
                className="navbar-profile-menu-user"
                onClick={() =>
                  setShowProfileMenu(false)
                }
              >

                <div className="navbar-profile-menu-avatar">

                  {user?.profileImage ? (
                    <img
  src={getImageUrl(user.profileImage)}
  alt={user?.fullName || "User"}
/>
                  ) : (
                    <span>
                      {
                        user?.fullName
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "U"
                      }
                    </span>
                  )}

                </div>

                <div>
                  <strong>
                    {user?.fullName || "User"}
                  </strong>

                  <span>
                    View your profile
                  </span>
                </div>

              </Link>


              <div className="navbar-profile-divider"></div>


              <Link
                to="/profile"
                className="navbar-profile-menu-item"
                onClick={() =>
                  setShowProfileMenu(false)
                }
              >
                👤
                <span>Profile</span>
              </Link>


              <Link
                to="/profile"
                className="navbar-profile-menu-item"
                onClick={() =>
                  setShowProfileMenu(false)
                }
              >
                ⚙️
                <span>Settings</span>
              </Link>


              <button
                type="button"
                className="navbar-profile-menu-item navbar-profile-logout"
                onClick={handleLogout}
              >
                🚪
                <span>Logout</span>
              </button>

            </div>
          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;