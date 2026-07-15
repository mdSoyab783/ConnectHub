import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const socket = io("http://localhost:3000");

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    console.log("Socket User Object:");
    console.dir(user);

    console.log("User Keys:");
    console.log(user ? Object.keys(user) : "No user");

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

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);