import "../../styles/navbar.css";

import { useAuth } from "../../context/AuthContext";

import SearchBar from "../search/SearchBar";
import NotificationBell from "../notification/NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">

      <div className="logo">
        ConnectHub
      </div>

      <SearchBar />

      <div className="nav-right">

        <NotificationBell />

        <span>
          {user?.username}
        </span>

        <button onClick={logout}>
          Logout
        </button>

      </div>

    </nav>
  );
};

export default Navbar;