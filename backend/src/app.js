// src/app.js
import express from 'express';
import cors from 'cors';

import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import eventRoutes from './routes/events.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors());

// ROUTES
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use('/api/events', eventRoutes);

// Error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Payload too large' });
  }
  next(err);
});

export default app;
