import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  description: { type: String },
  time: { type: String },
  capacity: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  attendees: { type: [String], default: [] }, // Can store an array of user IDs or emails
});

const Event = mongoose.model('Event', eventSchema);

export default Event; // Ensure this is a default export
