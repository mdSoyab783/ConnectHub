import { useEffect, useState } from "react";
import userService from "../../services/userService";
import SuggestedUserCard from "./SuggestedUserCard";

const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);

  const loadSuggestions = async () => {
    try {
      const response = await userService.getSuggestions();
      setUsers(response.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const removeUser = (id) => {
    setUsers((prev) =>
      prev.filter((user) => user._id !== id)
    );
  };

  return (
    <div className="suggested-users">
      <h3>Suggested Users</h3>

      {users.length === 0 ? (
        <p>No suggestions available.</p>
      ) : (
        users.map((user) => (
          <SuggestedUserCard
            key={user._id}
            user={user}
            onFollow={removeUser}
          />
        ))
      )}
    </div>
  );
};

export default SuggestedUsers;