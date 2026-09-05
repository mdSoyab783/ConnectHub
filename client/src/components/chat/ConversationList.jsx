import { useEffect, useState } from "react";
import { getUnreadCounts } from "../../services/messageService";
import { useSocket } from "../../context/SocketContext";
import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations = [],
  selectedConversation,
  setSelectedConversation,
}) => {
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  const { socket } = useSocket();

  // Load unread counts
  useEffect(() => {
    const loadUnreadCounts = async () => {
      try {
        const response = await getUnreadCounts();

        console.log(
          "Unread API Response:",
          JSON.stringify(response, null, 2)
        );

        const counts = {};

        response.unread.forEach((item) => {
          counts[item._id] = item.count;
        });

        console.log(
          "Unread Counts:",
          JSON.stringify(counts, null, 2)
        );

        setUnreadCounts(counts);
      } catch (error) {
        console.log(
          "Unread Error:",
          error.response?.data || error
        );
      }
    };

    loadUnreadCounts();
  }, [conversations]);

  // ==========================
// Real-Time Unread Messages
// ==========================
useEffect(() => {
  if (!socket) return;

  const handleNewUnreadMessage = ({ conversationId }) => {
    // If this conversation is currently open,
    // don't increase the unread badge.
    if (selectedConversation?._id === conversationId) {
      return;
    }

    setUnreadCounts((prev) => ({
      ...prev,
      [conversationId]:
        (prev[conversationId] || 0) + 1,
    }));
  };

  socket.on(
    "newUnreadMessage",
    handleNewUnreadMessage
  );

  return () => {
    socket.off(
      "newUnreadMessage",
      handleNewUnreadMessage
    );
  };
}, [socket, selectedConversation]);

  // Filter conversations
  const filtered = conversations.filter((conversation) => {
    const user = conversation.participants.find(
      (u) => u.fullName
    );

    return user?.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="conversation-list">
      <h2>Chats</h2>

      <input
        className="chat-search"
        placeholder="Search chats..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p>No conversations found.</p>
      ) : (
        filtered.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            unreadCount={
              unreadCounts[conversation._id] || 0
            }
            active={
              selectedConversation?._id ===
              conversation._id
            }
            onClick={() => {
  setUnreadCounts((prev) => ({
    ...prev,
    [conversation._id]: 0,
  }));

  setSelectedConversation(conversation);
}}
          />
        ))
      )}
    </div>
  );
};

export default ConversationList;