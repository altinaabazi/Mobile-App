import express from 'express';
import Event from '../models/Event.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// GET eventet e përdoruesit
router.get('/', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ user: userId }).sort({ date: 1 });
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në marrjen e eventeve' });
  }
});

// POST për ruajtjen e eventeve të reja
router.post('/', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, date, note } = req.body;

    const newEvent = new Event({
      user: userId,
      title,
      date,
      note,
    });

    await newEvent.save();
    res.status(201).json({ message: 'Eventi u ruajt me sukses', event: newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gabim në ruajtjen e eventit' });
  }
});


export default router;
