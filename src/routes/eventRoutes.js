import express from 'express';
import { getEvents, createEvent, calendarView, rsvpEvent } from '../controllers/eventController.js';
import isAdmin from '../utils/authMiddleware.js';

const router = express.Router();

// Routes for event management
router.get('/', getEvents);
router.post('/', isAdmin, createEvent);
router.get('/calendar', calendarView);
router.post('/rsvp', rsvpEvent);

export default router; // Export the router as the default
