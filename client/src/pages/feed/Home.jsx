import { useState } from "react";

import "./Home.css";

import CreatePost from "../../components/post/CreatePost";
import Feed from "../../components/post/Feed";
import SuggestedUsers from "../../components/suggestions/SuggestedUsers";
import OnlineFriends from "../../components/profile/OnlineFriends";

const Home = () => {
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handlePostCreated = () => {
    setRefreshFeed((prev) => prev + 1);
  };

  return (
    <div className="home-layout">

      <div className="feed-section">
        <CreatePost onPostCreated={handlePostCreated} />
        <Feed refreshTrigger={refreshFeed} />
      </div>

      <div className="sidebar-section">
        <SuggestedUsers />
        <OnlineFriends />
      </div>

    </div>
  );
};

export default Home;