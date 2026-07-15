import { useState } from "react";
import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
}) => {

  const [search, setSearch] = useState("");

  const filtered = conversations.filter((conversation) => {

    const user = conversation.participants.find(
      (u) => u.fullName
    );

    return user.fullName
      .toLowerCase()
      .includes(search.toLowerCase());

  });

  return (
    <div className="conversation-list">

      <h2>Chats</h2>

      <input
        className="chat-search"
        placeholder="Search chats..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {filtered.length === 0 ? (

        <p>No conversations.</p>

      ) : (

        filtered.map((conversation) => (

          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            active={
              selectedConversation?._id ===
              conversation._id
            }
            onClick={() =>
              setSelectedConversation(conversation)
            }
          />

        ))

      )}

    </div>
  );
};

export default ConversationList;