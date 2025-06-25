import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import Message from "../models/message.js";
const router = express.Router();

// POST /api/chat/send
router.post("/send", protectRoute, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      text,
    });

    await newMessage.save();

    res.status(201).json({ message: "Mesazhi u dërgua", newMessage });
  } catch (err) {
    console.error("Gabim gjatë dërgimit:", err.message);
    res.status(500).json({ message: "Gabim serveri" });
  }
});

// GET /api/chat/:userId
router.get("/:userId", protectRoute, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Gabim gjatë marrjes së mesazheve:", err.message);
    res.status(500).json({ message: "Gabim serveri" });
  }
});

export default router;
