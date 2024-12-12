import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Import routes and middleware
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import isAdmin from './utils/authMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON data
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Base Routes
app.use('/api/auth', authRoutes);  // Authentication routes
app.use('/api/events', eventRoutes); // Event routes

// Admin-only route for event creation
app.post('/api/admin/events', isAdmin, async (req, res) => {
  const { name, date, location, time, description, capacity } = req.body;

  if (!name || !capacity || !date) {
    return res.status(400).json({ message: 'Name, Capacity, and Date are required' });
  }

  try {
    const newEvent = new Event({
      name,
      date,
      location,
      description,
      time,
      capacity,
      availableSeats: capacity,
      attendees: [],
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
});

// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
