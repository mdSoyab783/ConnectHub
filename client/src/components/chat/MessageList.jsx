import { useEffect, useState } from "react";
import { getMessages } from "../../services/messageService";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

const MessageList = ({ conversation, refresh }) => {
  const { user } = useAuth();

  const currentUserId = user.id || user._id;

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversation) return;

    loadMessages();
  }, [conversation, refresh]);

  const loadMessages = async () => {
    try {
      const response = await getMessages(conversation._id);
      setMessages(response.messages || []);
    } catch (error) {
      console.log(error);
    }
  };

  if (!conversation) {
    return (
      <div className="message-list">
        <p>Select a conversation</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((message) => {
          const mine = message.sender._id === currentUserId;

          return (
            <div
              key={message._id}
              className={`message-row ${mine ? "mine" : "other"}`}
            >
              {!mine && (
                <div className="message-avatar">
                  <Avatar
                    src={message.sender.profileImage}
                    alt={message.sender.username}
                    size={36}
                  />
                </div>
              )}

              <div
                className={`message-bubble ${mine ? "mine" : "other"}`}
              >
                <p>{message.text}</p>

                <div className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;