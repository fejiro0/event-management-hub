import express from 'express';
import Event from './models/Event';
import User from './models/User';

const router = express.Router();

// RSVP to an event
router.post('/rsvp', async (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: 'User ID and Event ID are required' });
  }

  try {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if there are available seats
    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: 'No available seats for this event' });
    }

    // Find the user and add the event to their RSVPs
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already RSVPed to this event
    const alreadyRSVP = user.rsvpdEvents.some((rsvp) => rsvp.event.toString() === eventId);
    if (alreadyRSVP) {
      return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
    }

    // Decrease the available seats
    event.availableSeats -= 1;
    await event.save();

    // Add the event to the user's RSVP list
    user.rsvpdEvents.push({ event: eventId });
    await user.save();

    res.status(200).json({ message: 'RSVP successful', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;
