import Event from "../models/Event.js";

// ➕ Create Event
export const createEvent = async (req, res) => {
  try {
    const { name, title, description, minPrice, maxPrice, icon } = req.body;

    const event = await Event.create({
      name,
      title,
      description,
      icon,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Event
export const updateEvent = async (req, res) => {
  try {
    const { name, title, description, minPrice, maxPrice, icon } = req.body;

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        name,
        title,
        description,
        icon,
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑 Delete Event
export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};