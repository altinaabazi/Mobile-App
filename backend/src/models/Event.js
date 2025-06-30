import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  note: String,
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
