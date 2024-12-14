import Event from '../models/Event.js';

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();  // Retrieve events from the database
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Create a new event (Admin-only route)
export const createEvent = async (req, res) => {
  const { name, date, location, time, description, capacity } = req.body;

  if (!name || !capacity || !date) {
    return res.status(400).json({ message: 'Name, Capacity, and Date are required' });
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
      attendees: [],
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Calendar view for events (Example)
export const calendarView = async (req, res) => {
  try {
    const events = await Event.find();  // Retrieve events for calendar view (you can modify this query based on your needs)
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Error fetching events for calendar', error: error.message });
  }
};

// RSVP for an event
export const rsvpEvent = async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is already in the attendees list
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'User has already RSVP\'d to this event' });
    }

    // Add the user to the attendees list
    event.attendees.push(userId);
    await event.save();

    res.status(200).json({ message: 'RSVP successful', event });
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    res.status(500).json({ message: 'Error RSVPing to event', error: error.message });
  }
};
