
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   FlatList,
//   TextInput,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useAuthStore } from "../../../store/authStore";
// import axios from "axios";
// import { useSocket } from "../../../context/SocketContext";
// import { useChatContext } from "../../../context/ChatContext";

// export default function Chat() {
//   const { user, token } = useAuthStore();
//   const socket = useSocket();

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
// const { unreadMessages, setUnreadMessages } = useChatContext();
//   const [searchTerm, setSearchTerm] = useState("");

//   const flatListRef = useRef();

//   // Marrim userat
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get("http://10.0.2.2:5000/api/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(res.data.filter((u) => u._id !== user._id));
//       } catch (err) {
//         console.error("Gabim në marrjen e userave:", err.response?.data || err.message);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Marrim mesazhet për userin e zgjedhur
//   useEffect(() => {
//     if (!selectedUser) return;

//     const fetchMessages = async () => {
//       try {
//         const res = await axios.get(
//           `http://10.0.2.2:5000/api/chat/${selectedUser._id}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setMessages(res.data);
//         scrollToBottom();
//       } catch (err) {
//         console.error("Gabim në marrjen e mesazheve:", err.response?.data || err.message);
//       }
//     };
//     fetchMessages();
//   }, [selectedUser]);
// useEffect(() => {
//   if (!socket) {
//     console.log("❌ socket not ready");
//     return;
//   }

//   console.log("✅ socket connected:", socket.connected);

//  const handleMessage = (msg) => {
//   const selectedId = selectedUser?.id || selectedUser?._id;

//   if (
//     String(msg.senderId) === String(selectedId) ||
//     String(msg.receiverId) === String(selectedId)
//   ) {
//     setMessages((prev) => [...prev, msg]);
//     scrollToBottom();

//     // Nëse po bisedojmë me atë user, thirr `markAsRead` për ta pastruar unread
//     socket.emit("markAsRead", msg.senderId === user._id ? msg.receiverId : msg.senderId);
//   } else {
//     setUnreadMessages((prev) => ({
//       ...prev,
//       [msg.senderId]: (prev[msg.senderId] || 0) + 1,
//     }));
//   }
// };


//   const handleUnreadUpdate = (newUnread) => {
//     console.log("[handleUnreadUpdate] Shtohet nga serveri:", newUnread);
//     setUnreadMessages(newUnread);
//   };

//    socket.on("receiveMessage", handleMessage);
//   socket.on("unreadMessagesUpdate", handleUnreadUpdate);

//   return () => {
//     socket.off("receiveMessage", handleMessage);
//     socket.off("unreadMessagesUpdate", handleUnreadUpdate);
//     console.log("🧹 Pastrim socket listenera");
//   };
// }, [socket, selectedUser]);
// useEffect(() => {
//   if (socket && socket.connected) {
//     console.log("🎯 Thirr getUnreadMessages");
//     socket.emit("getUnreadMessages");

//     const handleUnreadUpdate = (unreadMap) => {
//       console.log("📢 unreadMessagesUpdate:", unreadMap);
//       setUnreadMessages(unreadMap);
//     };

//     socket.on("unreadMessagesUpdate", handleUnreadUpdate);

//     return () => {
//       socket.off("unreadMessagesUpdate", handleUnreadUpdate);
//     };
//   }
// }, [socket, socket?.connected]);

// // Fshij unread sapo hapet biseda
// useEffect(() => {
//   const selectedId = selectedUser?.id || selectedUser?._id;
//   if (selectedId && unreadMessages[selectedId]) {
//     console.log("[useEffect selectedUser] Fshij mesazhet e palexuara për:", selectedId);
//     setUnreadMessages((prev) => {
//       const updated = { ...prev };
//       delete updated[selectedId];
//       console.log("[useEffect selectedUser] unreadMessages pas fshirjes:", updated);
//       return updated;
//     });
//   }
// }, [selectedUser]);

// useEffect(() => {
//   if (socket && selectedUser) {
//     socket.emit("markAsRead", selectedUser._id);
//   }
// }, [selectedUser]);



// useEffect(() => {
//   if (selectedUser && unreadMessages[selectedUser._id]) {
//     console.log("[useEffect selectedUser] Fshij mesazhet e palexuara për:", selectedUser._id);
//     setUnreadMessages((prev) => {
//       const updated = { ...prev };
//       delete updated[selectedUser._id];
//       console.log("[useEffect selectedUser] unreadMessages pas fshirjes:", updated);
//       return updated;
//     });
//   }
// }, [selectedUser]);


//   const sendMessage = async () => {
//     if (!text.trim() || !selectedUser) return;

//     try {
//       socket.emit("sendMessage", {
//         receiverId: selectedUser._id,
//         text,
//       });

//       const res = await axios.post(
//         "http://10.0.2.2:5000/api/chat/send",
//         { receiverId: selectedUser._id, text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages((prev) => [...prev, res.data.newMessage]);
//       setText("");
//       scrollToBottom();
//     } catch (err) {
//       console.error("Gabim gjatë dërgimit:", err.response?.data || err.message);
//     }
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   };

//   if (!selectedUser) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Zgjedh përdoruesin për bisedë:</Text>

//         <TextInput
//           placeholder="Kërko user..."
//           value={searchTerm}
//           onChangeText={setSearchTerm}
//           style={styles.searchInput}
//         />

//         <FlatList
//           data={users.filter((u) =>
//             u.username.toLowerCase().includes(searchTerm.toLowerCase())
//           )}
//           keyExtractor={(item) => item._id}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               onPress={() => setSelectedUser(item)}
//               style={styles.userItem}
//             >
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Text style={styles.username}>{item.username}</Text>

//                 {unreadMessages[item._id] > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>{unreadMessages[item._id]}</Text>
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={90}
//     >
//       <Text style={styles.title}>Biseda me: {selectedUser.username}</Text>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(_, idx) => idx.toString()}
//         renderItem={({ item }) => {
// const isMe = user && String(item.senderId) === String(user.id || user._id);

//           return (
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: isMe ? "flex-end" : "flex-start",
//                 paddingHorizontal: 10,
//                 marginVertical: 4,
//               }}
//             >
//               <View
//                 style={[
//                   styles.messageBubble,
//                   isMe ? styles.messageRight : styles.messageLeft,
//                 ]}
//               >
//                 <Text style={styles.messageText}>{item.text}</Text>
//               </View>
//             </View>
//           );
//         }}
//         contentContainerStyle={{ paddingVertical: 10 }}
//         onContentSizeChange={() => scrollToBottom()}
//         onLayout={() => scrollToBottom()}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           value={text}
//           onChangeText={setText}
//           placeholder="Shkruaj mesazh..."
//           style={styles.input}
//           multiline
//           numberOfLines={2}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//           <Text style={styles.sendButtonText}>Dërgo</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backButton}>
//         <Text style={styles.backText}>← BACK</Text>
//       </TouchableOpacity>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   userItem: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 5,
//     elevation: 2,
//   },
//   username: { fontSize: 16 },

//   messageBubble: {
//     padding: 12,
//     marginVertical: 4,
//     borderRadius: 16,
//     maxWidth: "75%",
//   },

//   messageRight: {
//     alignSelf: "flex-end",
//     backgroundColor: "#DCF8C6",
//     borderTopRightRadius: 0,
//   },

//   messageLeft: {
//     alignSelf: "flex-start",
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 0,
//   },

//   messageText: {
//     fontSize: 16,
//     color: "#333",
//   },

//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//     borderRadius: 30,
//     elevation: 3,
//   },

//   input: {
//     flex: 1,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     height: 45,
//     maxHeight: 100,
//   },

//   sendButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginLeft: 8,
//   },

//   sendButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   backButton: {
//     marginTop: 10,
//     alignSelf: "center",
//   },

//   backText: {
//     color: "black",
//     fontSize: 16,
//   },

//   searchInput: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 16,
//     elevation: 2,
//   },

//   badge: {
//     backgroundColor: "red",
//     borderRadius: 12,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     marginLeft: 8,
//     minWidth: 24,
//     alignItems: "center",
//   },

//   badgeText: {
//     color: "white",
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   FlatList,
//   TextInput,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useAuthStore } from "../../../store/authStore";
// import axios from "axios";
// import { useSocket } from "../../../context/SocketContext";
// import { useChatContext } from "../../../context/ChatContext";

// export default function Chat() {
//   const { user, token } = useAuthStore();
//   const socket = useSocket();

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const { unreadMessages, setUnreadMessages } = useChatContext();
//   const [searchTerm, setSearchTerm] = useState("");

//   const flatListRef = useRef();

//   // Marrim userat
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         console.log("🛠️ Fetching users...");
//         const res = await axios.get("http://10.0.2.2:5000/api/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//      //   console.log("✅ Users fetched:", res.data);
//         setUsers(res.data.filter((u) => u._id !== user._id));
//       } catch (err) {
//         console.error("❌ Gabim në marrjen e userave:", err.response?.data || err.message);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Marrim mesazhet për userin e zgjedhur
//   useEffect(() => {
//     if (!selectedUser) return;

//     const fetchMessages = async () => {
//       try {
//         console.log(`🛠️ Fetching messages with user: ${selectedUser.username} (${selectedUser._id})`);
//         const res = await axios.get(
//           `http://10.0.2.2:5000/api/chat/${selectedUser._id}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         //console.log("✅ Messages fetched:", res.data);
//         setMessages(res.data);
//         scrollToBottom();
//       } catch (err) {
//         console.error("❌ Gabim në marrjen e mesazheve:", err.response?.data || err.message);
//       }
//     };
//     fetchMessages();
//   }, [selectedUser]);

//   useEffect(() => {
//     if (!socket) {
//       console.log("❌ socket not ready");
//       return;
//     }

//     console.log("✅ socket connected:", socket.connected);

//     const handleMessage = (msg) => {
//       const selectedId = selectedUser?._id;

//       console.log("📩 New message received:", msg);
//       console.log("👤 selectedUser:", selectedUser);
//       console.log("🔑 selectedId:", selectedId);
//       console.log("🆔 user._id:", user._id);

//       if (
//         String(msg.senderId) === String(selectedId) ||
//         String(msg.receiverId) === String(selectedId)
//       ) {
//         console.log("➡️ Message is for the selected chat, adding to messages");
//         setMessages((prev) => [...prev, msg]);
//         scrollToBottom();

//         // Nëse po bisedojmë me atë user, thirr `markAsRead` për ta pastruar unread
//         const markId = msg.senderId === user._id ? msg.receiverId : msg.senderId;
//         console.log("📨 Emitting markAsRead for userId:", markId);
//         socket.emit("markAsRead", markId);
//       } else {
//         console.log("🔔 Message is NOT for the selected chat, increasing unread count for sender:", msg.senderId);
//         setUnreadMessages((prev) => ({
//           ...prev,
//           [msg.senderId]: (prev[msg.senderId] || 0) + 1,
//         }));
//       }
//     };

//     const handleUnreadUpdate = (newUnread) => {
//       console.log("[handleUnreadUpdate] Shtohet nga serveri:", newUnread);
//       setUnreadMessages(newUnread);
//     };

//     socket.on("receiveMessage", handleMessage);
//     socket.on("unreadMessagesUpdate", handleUnreadUpdate);

//     return () => {
//       socket.off("receiveMessage", handleMessage);
//       socket.off("unreadMessagesUpdate", handleUnreadUpdate);
//       console.log("🧹 Pastrim socket listenera");
//     };
//   }, [socket, selectedUser]);

//   useEffect(() => {
//     if (socket && socket.connected) {
//       console.log("🎯 Thirr getUnreadMessages");
//       socket.emit("getUnreadMessages");

//       const handleUnreadUpdate = (unreadMap) => {
//         console.log("📢 unreadMessagesUpdate:", unreadMap);
//         setUnreadMessages(unreadMap);
//       };

//       socket.on("unreadMessagesUpdate", handleUnreadUpdate);

//       return () => {
//         socket.off("unreadMessagesUpdate", handleUnreadUpdate);
//       };
//     }
//   }, [socket, socket?.connected]);

//   // Fshij unread sapo hapet biseda
//   useEffect(() => {
//     const selectedId = selectedUser?._id;
//     if (selectedId && unreadMessages[selectedId]) {
//       console.log("[useEffect selectedUser] Fshij mesazhet e palexuara për:", selectedId);
//       setUnreadMessages((prev) => {
//         const updated = { ...prev };
//         delete updated[selectedId];
//         console.log("[useEffect selectedUser] unreadMessages pas fshirjes:", updated);
//         return updated;
//       });
//     }
//   }, [selectedUser]);

//   useEffect(() => {
//     if (socket && selectedUser) {
//       console.log("📨 Emitting markAsRead for selectedUser:", selectedUser._id);
//       socket.emit("markAsRead", selectedUser._id);
//     }
//   }, [selectedUser]);

//   useEffect(() => {
//     if (selectedUser && unreadMessages[selectedUser._id]) {
//       console.log("[useEffect selectedUser] Fshij mesazhet e palexuara për:", selectedUser._id);
//       setUnreadMessages((prev) => {
//         const updated = { ...prev };
//         delete updated[selectedUser._id];
//         console.log("[useEffect selectedUser] unreadMessages pas fshirjes:", updated);
//         return updated;
//       });
//     }
//   }, [selectedUser]);

//   const sendMessage = async () => {
//     if (!text.trim() || !selectedUser) {
//       console.log("⚠️ Nuk mund të dërgohet mesazh pa përmbajtje ose pa zgjedhur user");
//       return;
//     }

//     try {
//       console.log(`✉️ Dërgoj mesazh tek ${selectedUser.username} (${selectedUser._id}):`, text);
//       socket.emit("sendMessage", {
//         receiverId: selectedUser._id,
//         text,
//       });

//       const res = await axios.post(
//         "http://10.0.2.2:5000/api/chat/send",
//         { receiverId: selectedUser._id, text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("✅ Mesazhi u ruajt në server:", res.data.newMessage);
//       //setMessages((prev) => [...prev, res.data.newMessage]);
//       setText("");
//       scrollToBottom();
//     } catch (err) {
//       console.error("❌ Gabim gjatë dërgimit:", err.response?.data || err.message);
//     }
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   };

//   if (!selectedUser) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Zgjedh përdoruesin për bisedë:</Text>

//         <TextInput
//           placeholder="Kërko user..."
//           value={searchTerm}
//           onChangeText={setSearchTerm}
//           style={styles.searchInput}
//         />

//         <FlatList
//           data={users.filter((u) =>
//             u.username.toLowerCase().includes(searchTerm.toLowerCase())
//           )}
//           keyExtractor={(item) => item._id}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               onPress={() => setSelectedUser(item)}
//               style={styles.userItem}
//             >
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Text style={styles.username}>{item.username}</Text>

//                 {unreadMessages[item._id] > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>{unreadMessages[item._id]}</Text>
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={90}
//     >
//       <Text style={styles.title}>Biseda me: {selectedUser.username}</Text>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(_, idx) => idx.toString()}
//         renderItem={({ item }) => {
//           const isMe = user && String(item.senderId) === String(user.id || user._id);

//           return (
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: isMe ? "flex-end" : "flex-start",
//                 paddingHorizontal: 10,
//                 marginVertical: 4,
//               }}
//             >
//               <View
//                 style={[
//                   styles.messageBubble,
//                   isMe ? styles.messageRight : styles.messageLeft,
//                 ]}
//               >
//                 <Text style={styles.messageText}>{item.text}</Text>
//               </View>
//             </View>
//           );
//         }}
//         contentContainerStyle={{ paddingVertical: 10 }}
//         onContentSizeChange={() => scrollToBottom()}
//         onLayout={() => scrollToBottom()}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           value={text}
//           onChangeText={setText}
//           placeholder="Shkruaj mesazh..."
//           style={styles.input}
//           multiline
//           numberOfLines={2}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//           <Text style={styles.sendButtonText}>Dërgo</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backButton}>
//         <Text style={styles.backText}>← BACK</Text>
//       </TouchableOpacity>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   userItem: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 5,
//     elevation: 2,
//   },
//   username: { fontSize: 16 },

//   messageBubble: {
//     padding: 12,
//     marginVertical: 4,
//     borderRadius: 16,
//     maxWidth: "75%",
//   },

//   messageRight: {
//     alignSelf: "flex-end",
//     backgroundColor: "#DCF8C6",
//     borderTopRightRadius: 0,
//   },

//   messageLeft: {
//     alignSelf: "flex-start",
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 0,
//   },

//   messageText: {
//     fontSize: 16,
//     color: "#333",
//   },

//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//     borderRadius: 30,
//     elevation: 3,
//   },

//   input: {
//     flex: 1,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     height: 45,
//     maxHeight: 100,
//   },

//   sendButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginLeft: 8,
//   },

//   sendButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   backButton: {
//     marginTop: 10,
//     alignSelf: "center",
//   },

//   backText: {
//     color: "black",
//     fontSize: 16,
//   },

//   searchInput: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 16,
//     elevation: 2,
//   },

//   badge: {
//     backgroundColor: "red",
//     borderRadius: 12,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     marginLeft: 8,
//     minWidth: 24,
//     alignItems: "center",
//   },

//   badgeText: {
//     color: "white",
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";
import { useSocket } from "../../../context/SocketContext";
import { useChatContext } from "../../../context/ChatContext";

export default function Chat() {
  const { user, token } = useAuthStore();
  const socket = useSocket();
  const { unreadMessages, setUnreadMessages } = useChatContext();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const flatListRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://10.0.2.2:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("❌ Gabim në marrjen e userave:", err.response?.data || err.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://10.0.2.2:5000/api/chat/${selectedUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error("❌ Gabim në marrjen e mesazheve:", err.response?.data || err.message);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;

const handleMessage = (msg) => {
  const selectedId = selectedUser?._id || selectedUser?.id;

  const alreadyExists = messages.some(
    (m) =>
      m._id === msg._id || // kontrollo me _id
      (m.text === msg.text &&
        m.senderId === msg.senderId &&
        m.receiverId === msg.receiverId)
  );

  if (alreadyExists) return;

  if (
    String(msg.senderId) === String(selectedId) ||
    String(msg.receiverId) === String(selectedId)
  ) {
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();

    socket.emit("markAsRead", msg.senderId === user._id ? msg.receiverId : msg.senderId);
  } else {
    setUnreadMessages((prev) => ({
      ...prev,
      [msg.senderId]: (prev[msg.senderId] || 0) + 1,
    }));
  }
};





    const handleUnreadUpdate = (newUnread) => {
      setUnreadMessages(newUnread);
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("unreadMessagesUpdate", handleUnreadUpdate);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("unreadMessagesUpdate", handleUnreadUpdate);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit("getUnreadMessages");

      const handleUnreadUpdate = (unreadMap) => {
        setUnreadMessages(unreadMap);
      };

      socket.on("unreadMessagesUpdate", handleUnreadUpdate);

      return () => {
        socket.off("unreadMessagesUpdate", handleUnreadUpdate);
      };
    }
  }, [socket?.connected]);

  useEffect(() => {
    if (selectedUser && unreadMessages[selectedUser._id]) {
      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[selectedUser._id];
        return updated;
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (socket && selectedUser) {
      socket.emit("markAsRead", selectedUser._id);
    }
  }, [selectedUser]);

const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    try {
      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        text,
      });

      const res = await axios.post(
        "http://10.0.2.2:5000/api/chat/send",
        { receiverId: selectedUser._id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      //setMessages((prev) => [...prev, res.data.newMessage]);
      setText("");
      scrollToBottom();
    } catch (err) {
      console.error("Gabim gjatë dërgimit:", err.response?.data || err.message);
    }
  };


  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!selectedUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Zgjedh përdoruesin për bisedë:</Text>

        <TextInput
          placeholder="Kërko user..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />

        <FlatList
          data={users.filter((u) =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedUser(item)}
              style={styles.userItem}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.username}>{item.username}</Text>

                {unreadMessages[item._id] > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadMessages[item._id]}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.title}>Biseda me: {selectedUser.username}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => {
          const isMe = user && String(item.senderId) === String(user.id || user._id);

          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: isMe ? "flex-end" : "flex-start",
                paddingHorizontal: 10,
                marginVertical: 4,
              }}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.messageRight : styles.messageLeft,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() => scrollToBottom()}
        onLayout={() => scrollToBottom()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Shkruaj mesazh..."
          style={styles.input}
          multiline
          numberOfLines={2}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Dërgo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backButton}>
        <Text style={styles.backText}>← BACK</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  userItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  username: { fontSize: 16 },

  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 16,
    maxWidth: "75%",
  },

  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },

  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
  },

  messageText: {
    fontSize: 16,
    color: "#333",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    elevation: 3,
  },

  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    height: 45,
    maxHeight: 100,
  },

  sendButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },

  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 10,
    alignSelf: "center",
  },

  backText: {
    color: "black",
    fontSize: 16,
  },

  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2,
  },

  badge: {
    backgroundColor: "red",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: "center",
  },

  badgeText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
