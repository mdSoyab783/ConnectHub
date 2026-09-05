import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const socket = io("http://localhost:3000");

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const userId = user.id || user._id;

    if (!userId) return;

    console.log("Joining socket:", userId);

    socket.emit("join", userId);

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [user]);

  // ==========================
  // Conversation Helpers
  // ==========================

  const joinConversation = (conversationId) => {
    if (!conversationId) return;

    socket.emit("joinConversation", conversationId);
  };

  const leaveConversation = (conversationId) => {
    if (!conversationId) return;

    socket.emit("leaveConversation", conversationId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        joinConversation,
        leaveConversation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);