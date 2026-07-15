import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getConversations } from "../../services/conversationService";

import ConversationList from "../../components/chat/ConversationList";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";

import "./Chat.css";

const Chat = () => {
  const { conversationId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [refreshMessages, setRefreshMessages] = useState(0);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const conversation = conversations.find(
      (c) => c._id === conversationId
    );

    if (conversation) {
      setSelectedConversation(conversation);
    }
  }, [conversationId, conversations]);

  const loadConversations = async () => {
    try {
      const response = await getConversations();

      setConversations(response.conversations || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      </div>

      <div className="chat-main">
        <ChatHeader conversation={selectedConversation} />

        <MessageList
          conversation={selectedConversation}
          refresh={refreshMessages}
        />

        <MessageInput
          conversation={selectedConversation}
          onMessageSent={() =>
            setRefreshMessages((prev) => prev + 1)
          }
        />
      </div>
    </div>
  );
};

export default Chat;