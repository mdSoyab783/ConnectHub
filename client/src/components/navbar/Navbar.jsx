import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notification/NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        padding: "15px 30px",
        background: "#fff",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Logo */}
      <h2 style={{ margin: 0 }}>ConnectHub</h2>

      {/* Right Side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/profile" style={{ textDecoration: "none" }}>
          Profile
        </Link>

        <NotificationBell />

        <span>
          {user?.fullName}
        </span>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;