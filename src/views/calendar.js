const fetchEvents = async () => {
    const response = await fetch('/api/events/calendar?start=2023-12-01&end=2023-12-31');
    const events = await response.json();
    console.log(events);
    // Render events in the calendar
  };
  
  fetchEvents();
  