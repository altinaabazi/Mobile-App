// // import express from "express";
// // import cors from "cors";
// // import "dotenv/config";

// // import authRoutes from "./routes/authRoutes.js";
// // import bookRoutes from "./routes/bookRoutes.js";

// // import {connectDB} from "./lib/db.js";

// // const app = express();
// // const PORT = process.env.PORT

// // // app.use(express.json()); // për të lexuar JSON body
// // // app.use(cors());
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // app.use("/api/auth", authRoutes);
// // app.use("/api/books/",bookRoutes)

// // app.listen(PORT, () => {
// // console.log(`Server is running on port ${PORT}`);
// // connectDB();
// // });

// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';

// import bookRoutes from './routes/bookRoutes.js';
// import authRoutes from './routes/authRoutes.js';
// import userRoutes from "./routes/user.js";
// import adminRoutes from "./routes/admin.js"
// import chatRoutes from "./routes/chat.js"
// const app = express();

// // ✅ Këtu vendosim limitin e body
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// app.use(cors());

// // Routes
// app.use('/api/books', bookRoutes);
// app.use('/api/auth', authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/admin", adminRoutes); 
// app.use("/api/chat", chatRoutes);

// // Error handler për Payload Too Large
// app.use((err, req, res, next) => {
//   if (err.type === 'entity.too.large') {
//     return res.status(413).json({ message: 'Payload too large' });
//   }
//   next(err);
// });

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => app.listen(5000, () => console.log('Server running on port 5000')))
//   .catch(err => console.error(err));

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http'; // për të krijuar serverin
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import Message from './models/message.js';
import User from "./models/User.js";

const app = express();
const server = http.createServer(app); // <-- krijo http server për socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // vendose URL frontend në prodhim
    methods: ["GET", "POST"],
  },
});

const unreadMessagesMap = new Map(); // { userId: { senderId1: count, senderId2: count, ... } }

// ================== SOCKET.IO ========================
const onlineUsers = new Map();

// io.on("connection", (socket) => {
//   console.log("📡 New client connected:", socket.id);

// socket.on("join", async (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId);
//       if (!user) return;

//       socket.userId = user._id.toString();
//       onlineUsers.set(socket.userId, socket.id);

//       // Kur user bashkangjitet, i dërgo numrin e mesazheve te palexuara
//       const userUnread = unreadMessagesMap.get(socket.userId) || {};
//       io.to(socket.id).emit("unreadMessagesUpdate", userUnread);

//     } catch (err) {
//       console.log("⛔ Invalid token on socket join");
//     }
//   });

// socket.on("sendMessage", async ({ receiverId, text }) => {
//   if (!socket.userId) return;

//   const newMessage = new Message({
//     senderId: socket.userId,
//     receiverId,
//     text,
//   });
//   await newMessage.save();

//   const messagePayload = {
//     _id: newMessage._id, // nëse don me e ruajt në frontend pa dublim
//     senderId: socket.userId,
//     receiverId,
//     text,
//     timestamp: Date.now(),
//   };

//   const receiverSocketId = onlineUsers.get(receiverId);
//   if (receiverSocketId) {
//     io.to(receiverSocketId).emit("receiveMessage", messagePayload);
//   }

//   // Dërgo mesazhin edhe për senderin
//   const senderSocketId = onlineUsers.get(socket.userId);
//   if (senderSocketId) {
//     io.to(senderSocketId).emit("receiveMessage", messagePayload);
//   }

//   // Update unread count për receiver
//   let receiverUnread = unreadMessagesMap.get(receiverId) || {};
//   receiverUnread[socket.userId] = (receiverUnread[socket.userId] || 0) + 1;
//   unreadMessagesMap.set(receiverId, receiverUnread);

//   // Update unread count real-time te receiver
//   if (receiverSocketId) {
//     io.to(receiverSocketId).emit("unreadMessagesUpdate", receiverUnread);
//   }
// });


//   // Kur klienti i thotë që lexoi mesazhet me userin e caktuar, fshi unread count
//   socket.on("markAsRead", (otherUserId) => {
//     if (!socket.userId) return;

//     let userUnread = unreadMessagesMap.get(socket.userId) || {};
//     if (userUnread[otherUserId]) {
//       delete userUnread[otherUserId];
//       unreadMessagesMap.set(socket.userId, userUnread);

//       // Dërgo update te klient për unread
//       const socketId = onlineUsers.get(socket.userId);
//       if (socketId) {
//         io.to(socketId).emit("unreadMessagesUpdate", userUnread);
//       }
//     }
//   });

//   // Kur klienti kërkon të marrë numrin aktual të unread messages
//   socket.on("getUnreadMessages", () => {
//     if (!socket.userId) return;

//     const userUnread = unreadMessagesMap.get(socket.userId) || {};
//     io.to(socket.id).emit("unreadMessagesUpdate", userUnread);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected:", socket.id);
//     onlineUsers.forEach((value, key) => {
//       if (value === socket.id) {
//         onlineUsers.delete(key);
//       }
//     });
//   });
// });

// ================= MIDDLEWARE ========================
io.on("connection", (socket) => {
  console.log("📡 New client connected:", socket.id);

  socket.on("join", async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return;

      socket.userId = user._id.toString();
      onlineUsers.set(socket.userId, socket.id);

      const userUnread = unreadMessagesMap.get(socket.userId) || {};
      io.to(socket.id).emit("unreadMessagesUpdate", userUnread);

    } catch (err) {
      console.log("⛔ Invalid token on socket join");
    }
  });

  socket.on("sendMessage", async ({ receiverId, text }) => {
    if (!socket.userId) return;

    const newMessage = new Message({
      senderId: socket.userId,
      receiverId,
      text,
    });
    await newMessage.save();

    const messagePayload = {
      _id: newMessage._id,
      senderId: socket.userId,
      receiverId,
      text,
      timestamp: Date.now(),
    };

    const receiverSocketId = onlineUsers.get(receiverId);
    const senderSocketId = onlineUsers.get(socket.userId);

    // ✅ Dërgo vetëm një herë te secili socket unik
    const sentTo = new Set();

    if (receiverSocketId && !sentTo.has(receiverSocketId)) {
      io.to(receiverSocketId).emit("receiveMessage", messagePayload);
      sentTo.add(receiverSocketId);
    }

    if (senderSocketId && !sentTo.has(senderSocketId)) {
      io.to(senderSocketId).emit("receiveMessage", messagePayload);
      sentTo.add(senderSocketId);
    }

    // 🔄 Update unread count për receiver
    let receiverUnread = unreadMessagesMap.get(receiverId) || {};
    receiverUnread[socket.userId] = (receiverUnread[socket.userId] || 0) + 1;
    unreadMessagesMap.set(receiverId, receiverUnread);

    // 📬 Dërgo update te receiver për unread
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("unreadMessagesUpdate", receiverUnread);
    }
  });

  socket.on("markAsRead", (otherUserId) => {
    if (!socket.userId) return;

    let userUnread = unreadMessagesMap.get(socket.userId) || {};
    if (userUnread[otherUserId]) {
      delete userUnread[otherUserId];
      unreadMessagesMap.set(socket.userId, userUnread);

      const socketId = onlineUsers.get(socket.userId);
      if (socketId) {
        io.to(socketId).emit("unreadMessagesUpdate", userUnread);
      }
    }
  });

  socket.on("getUnreadMessages", () => {
    if (!socket.userId) return;

    const userUnread = unreadMessagesMap.get(socket.userId) || {};
    io.to(socket.id).emit("unreadMessagesUpdate", userUnread);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
  });
});


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors());

// ================= ROUTES ===========================
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Payload too large' });
  }
  next(err);
});

// =============== DATABASE & SERVER ==================
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(5000, () => {
      console.log('🚀 Server + Socket.io running on port 5000');
    });
  })
  .catch(err => console.error(err));
