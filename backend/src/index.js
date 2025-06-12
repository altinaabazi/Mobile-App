// import express from "express";
// import cors from "cors";
// import "dotenv/config";

// import authRoutes from "./routes/authRoutes.js";
// import bookRoutes from "./routes/bookRoutes.js";

// import {connectDB} from "./lib/db.js";

// const app = express();
// const PORT = process.env.PORT

// // app.use(express.json()); // për të lexuar JSON body
// // app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use("/api/auth", authRoutes);
// app.use("/api/books/",bookRoutes)

// app.listen(PORT, () => {
// console.log(`Server is running on port ${PORT}`);
// connectDB();
// });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import bookRoutes from './routes/books.js';
import authRoutes from './routes/auth.js';

const app = express();

// ✅ Këtu vendosim limitin e body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors());

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

// Error handler për Payload Too Large
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Payload too large' });
  }
  next(err);
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(5000, () => console.log('Server running on port 5000')))
  .catch(err => console.error(err));
