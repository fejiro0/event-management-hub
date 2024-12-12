import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: false },
  location: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  attendees: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
    },
  ],
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
