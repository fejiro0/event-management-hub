import Event from '../models/Event.js';

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Fetch events sorted by date
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
};

// Create a new event (Admin only)
export const createEvent = async (req, res) => {
  const { name, date, location, time, description, capacity } = req.body;

  if (!name || !capacity || !date) {
    return res.status(400).json({ message: 'Name, capacity, and date are required' });
  }

  try {
    const newEvent = new Event({
      name,
      date,
      location,
      time,
      description,
      capacity,
      availableSeats: capacity,
      attendees: [], // Initialize attendees as an empty array
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
};

// RSVP for an event
export const rsvpEvent = async (req, res) => {
  const { eventId, userId, userName } = req.body;

  if (!eventId || !userId || !userName) {
    return res.status(400).json({ message: 'Event ID, User ID, and User Name are required' });
  }

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: 'No available seats' });
    }

    // Check if the user has already RSVPed
    const hasRSVPed = event.attendees.some(att => att.userId === userId);
    if (hasRSVPed) {
      return res.status(400).json({ message: 'User has already RSVPed for this event' });
    }

    // Add the user to attendees
    event.attendees.push({ userId, name: userName });
    event.availableSeats -= 1; // Decrease available seats by 1

    await event.save();
    res.status(200).json({ message: 'RSVP successful', event });
  } catch (err) {
    console.error('Error RSVPing for event:', err);
    res.status(500).json({ message: 'Error RSVPing for event', error: err.message });
  }
};

// Get calendar view of events
export const calendarView = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events for calendar:', err);
    res.status(500).json({ message: 'Error fetching calendar events', error: err.message });
  }
};
