import SuggestedUsers from "../suggestions/SuggestedUsers";
import OnlineFriends from "../friends/OnlineFriends";

import "../../styles/RightSidebar.css";

const RightSidebar = () => {
  return (
    <div className="right-sidebar-content">

      {/* Suggested Users */}
      <section className="right-sidebar-section">
        <SuggestedUsers />
      </section>

      {/* Online Friends */}
      <section className="right-sidebar-section">
        <div className="right-sidebar-heading">
          <span className="online-heading-dot"></span>

          <h3>Online Friends</h3>
        </div>

        <OnlineFriends />
      </section>

    </div>
  );
};

export default RightSidebar;