import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getConversations } from "../../services/conversationService";
import { useSocket } from "../../context/SocketContext";

import ConversationList from "../../components/chat/ConversationList";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";

import "./Chat.css";

const Chat = () => {
  const {
    socket,
    joinConversation,
    leaveConversation,
  } = useSocket();

  const { conversationId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  // Reply state
  const [replyMessage, setReplyMessage] = useState(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await getConversations();

        const list = response.conversations || [];

        setConversations(list);

        if (list.length === 0) {
          setSelectedConversation(null);
          return;
        }

        if (conversationId) {
          const requestedConversation = list.find(
            (conversation) =>
              conversation._id?.toString() ===
              conversationId.toString()
          );

          if (requestedConversation) {
            setSelectedConversation(
              requestedConversation
            );
            return;
          }
        }

        setSelectedConversation(list[0]);
      } catch (error) {
        console.log(
          "Conversation Error:",
          error
        );
      }
    };

    loadConversations();
  }, [conversationId]);

  // Receive new message
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      setConversations((prev) => {
        const index = prev.findIndex(
          (conversation) =>
            conversation._id?.toString() ===
            message.conversation?.toString()
        );

        if (index === -1) {
          return prev;
        }

        const updatedConversation = {
          ...prev[index],
          lastMessage: message,
        };

        const newList = [...prev];

        newList.splice(index, 1);
        newList.unshift(updatedConversation);

        return newList;
      });
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, [socket]);

  // Join selected conversation
  useEffect(() => {
    if (!selectedConversation?._id) {
      return;
    }

    joinConversation(
      selectedConversation._id
    );

    return () => {
      leaveConversation(
        selectedConversation._id
      );
    };
  }, [
    selectedConversation?._id,
    joinConversation,
    leaveConversation,
  ]);

  // Message sent
  const handleMessageSent = (message) => {
    if (!selectedConversation) {
      return;
    }

    setConversations((prev) => {
      const index = prev.findIndex(
        (conversation) =>
          conversation._id?.toString() ===
          selectedConversation._id?.toString()
      );

      if (index === -1) {
        return prev;
      }

      const updatedConversation = {
        ...prev[index],
        lastMessage: message,
      };

      const newList = [...prev];

      newList.splice(index, 1);
      newList.unshift(updatedConversation);

      return newList;
    });

    // Clear reply after sending
    setReplyMessage(null);
  };

  // Reply clicked
  const handleReplyMessage = (message) => {
    console.log("Reply clicked:", message);

    setReplyMessage(message);
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyMessage(null);
  };

  // Select conversation
  const handleSelectConversation = (
    conversation
  ) => {
    setSelectedConversation(
      conversation
    );

    // Clear reply when switching chat
    setReplyMessage(null);
  };

  return (
    <div className="chat-page">

      <aside className="chat-sidebar">
        <ConversationList
          conversations={conversations}
          selectedConversation={
            selectedConversation
          }
          setSelectedConversation={
            handleSelectConversation
          }
        />
      </aside>

      <section className="chat-main">

        {selectedConversation ? (
          <>
            <div className="chat-header-wrapper">
              <ChatHeader
                conversation={
                  selectedConversation
                }
              />
            </div>

            <div className="chat-messages-wrapper">
              <MessageList
                conversation={
                  selectedConversation
                }
                onReplyMessage={
                  handleReplyMessage
                }
              />
            </div>

            <div className="chat-input-wrapper">
              <MessageInput
                conversation={
                  selectedConversation
                }
                onMessageSent={
                  handleMessageSent
                }
                replyMessage={
                  replyMessage
                }
                onCancelReply={
                  handleCancelReply
                }
              />
            </div>
          </>
        ) : (
          <div className="empty-chat">

            <div className="empty-chat-icon">
              💬
            </div>

            <h2>
              Welcome to ConnectHub
            </h2>

            <p>
              Select a conversation to
              start chatting.
            </p>

          </div>
        )}

      </section>

    </div>
  );
};

export default Chat;