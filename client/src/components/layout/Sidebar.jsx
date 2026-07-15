import { Link } from "react-router-dom";
import "../../styles/sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">

      <Link to="/">
        🏠 Home
      </Link>

      <Link to="/profile">
        👤 Profile
      </Link>

      <Link to="/profile">
        ⚙ Settings
      </Link>

    </div>
  );
};

export default Sidebar;