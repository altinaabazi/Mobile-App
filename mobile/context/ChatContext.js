// import React, { createContext, useContext, useState,useEffect } from "react";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [unreadMessages, setUnreadMessages] = useState({});
// useEffect(() => {
//   console.log("🔁 unreadMessages u ndryshua:", unreadMessages);
// }, [unreadMessages]);

//   const totalUnread = Object.values(unreadMessages).reduce((acc, count) => acc + count, 0);

//   return (
//     <ChatContext.Provider value={{ unreadMessages, setUnreadMessages, totalUnread }}>
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChatContext = () => useContext(ChatContext);
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useSocket } from "./SocketContext";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const socket = useSocket();
//   const [unreadMessages, setUnreadMessages] = useState({}); // { senderId: count }
  
//   useEffect(() => {
//     if (!socket) return; // Nëse socket-i nuk është gati, mos vazhdo
    
//     // Kur merret update me unread messages nga serveri
//     const handleUnreadUpdate = (unreadData) => {
//       setUnreadMessages(unreadData);
//     };
    
//     // Kur vjen një mesazh i ri, shto 1 unread për dërguesin
//     const handleReceiveMessage = ({ senderId }) => {
//       setUnreadMessages((prev) => {
//         return {
//           ...prev,
//           [senderId]: (prev[senderId] || 0) + 1,
//         };
//       });
//     };
    
//     socket.on("unreadMessagesUpdate", handleUnreadUpdate);
//     socket.on("receiveMessage", handleReceiveMessage);
    
//     // Merr unread messages kur komponenti ngarkohet (ose token ndryshon)
//     socket.emit("getUnreadMessages");
    
//     return () => {
//       socket.off("unreadMessagesUpdate", handleUnreadUpdate);
//       socket.off("receiveMessage", handleReceiveMessage);
//     };
//   }, [socket]);
  
//   // Funksion për të shënuar si të lexuara mesazhet nga një user i caktuar
//   const markAsRead = (otherUserId) => {
//     if (!socket) return;
    
//     // Fshi numrin e palexuar nga local state
//     setUnreadMessages((prev) => {
//       const copy = { ...prev };
//       delete copy[otherUserId];
//       return copy;
//     });
    
//     // Njofto backend-in
//     socket.emit("markAsRead", otherUserId);
//   };
  
//   // Total numër i mesazheve të palexuara
//   const totalUnread = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  
//   return (
//     <ChatContext.Provider value={{ unreadMessages, totalUnread, markAsRead }}>
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChatContext = () => useContext(ChatContext);
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
