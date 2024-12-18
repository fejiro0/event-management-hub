router.post('/rsvp', async (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: 'User ID and Event ID are required' });
  }

  try {
    // Atomic update to decrement availableSeats
    const event = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );

    if (!event) {
      return res.status(400).json({ message: 'No available seats for this event' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already RSVPed
    const alreadyRSVP = user.rsvpdEvents.some((rsvp) => rsvp.event.toString() === eventId);
    if (alreadyRSVP) {
      // Revert seat decrement if already RSVPed
      event.availableSeats += 1;
      await event.save();
      return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
    }

    // Add the event to the user's RSVP list
    user.rsvpdEvents.push({ event: eventId });
    await user.save();

    res.status(200).json({
      message: 'RSVP successful',
      event: {
        id: event._id,
        name: event.name,
        availableSeats: event.availableSeats
      },
      user: {
        id: user._id,
        name: user.name,
        rsvpdEvents: user.rsvpdEvents
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
