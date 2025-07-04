
// export const useSocket = () => useContext(SocketContext);
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const newSocket = io("http://10.0.2.2:5000", {
        transports: ["websocket"],
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("🔌 Socket connected with id:", newSocket.id);
        newSocket.emit("join", token);
        newSocket.emit("getUnreadMessages");
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
