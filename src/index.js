import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { authMiddleware, checkAdmin } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/user.js';
import Event from './models/Event.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);

// Admin route
app.post('/api/admin/events', [authMiddleware, checkAdmin], async (req, res) => {
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

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

export default app; // Export the app
