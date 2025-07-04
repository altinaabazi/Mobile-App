
import React, { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    console.log("🔁 unreadMessages u ndryshua:", unreadMessages);
  }, [unreadMessages]);

  const totalUnread = Object.values(unreadMessages).reduce((acc, count) => acc + count, 0);

  return (
    <ChatContext.Provider value={{ unreadMessages, setUnreadMessages, totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
