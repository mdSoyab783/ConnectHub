import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import { useSocket } from "../../context/SocketContext";

const SearchResults = ({ users, clearSearch }) => {
  const { onlineUsers } = useSocket();

  if (!users.length) return null;

  return (
    <div className="search-results">
      {users.map((user) => {
        const isOnline = onlineUsers.includes(user._id);

        return (
          <Link
            key={user._id}
            to={`/users/${user._id}`}
            className="search-user"
            onClick={clearSearch}
          >
            <div className="avatar-wrapper">
              <Avatar
                src={user.profileImage}
                alt={user.username}
                size={45}
              />

              {isOnline && (
                <span className="online-indicator small"></span>
              )}
            </div>

            <div>
              <strong>{user.fullName}</strong>
              <p>@{user.username}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SearchResults;