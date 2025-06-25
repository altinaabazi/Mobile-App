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
import Message from "./models/Message.js";
import User from "./models/User.js";

const app = express();
const server = http.createServer(app); // <-- krijo http server për socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // vendose URL frontend në prodhim
    methods: ["GET", "POST"],
  },
});

// ================== SOCKET.IO ========================
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("📡 New client connected:", socket.id);

  socket.on("join", async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) return;

      socket.userId = user._id.toString();
      onlineUsers.set(socket.userId, socket.id);

      console.log(`✅ User ${user.username} (${socket.userId}) joined`);
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

    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId: socket.userId,
        text,
        timestamp: Date.now(),
      });
    }
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

// ================= MIDDLEWARE ========================
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
