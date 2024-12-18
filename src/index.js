import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'; 
import { authMiddleware, checkAdmin } from './middleware/authMiddleware.js'; 

// Import routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import Event from './models/Event.js';
import userRoutes from './routes/user.js';


// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Global Middleware
app.use(cors({
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // Log incoming requests


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Base Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/events', eventRoutes); // Event routes, protected by authentication
app.use("/api/user", userRoutes);

// Admin-only route for event creation
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

// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
