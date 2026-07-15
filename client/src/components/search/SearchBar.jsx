import { useEffect, useState } from "react";
import userService from "../../services/userService";
import SearchResults from "./SearchResults";
import "./Search.css";
const SearchBar = () => {

  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {

    const timer = setTimeout(async () => {

      if (!keyword.trim()) {
        setUsers([]);
        return;
      }

      try {
        const response = await userService.searchUsers(keyword);
        setUsers(response.users);
      } catch (error) {
        console.log(error);
      }

    }, 300);

    return () => clearTimeout(timer);

  }, [keyword]);

  return (
    <div className="search-container">

      <input
        type="text"
        placeholder="Search users..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <SearchResults
        users={users}
        clearSearch={() => {
          setKeyword("");
          setUsers([]);
        }}
      />

    </div>
  );
};

export default SearchBar;