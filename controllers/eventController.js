import Event from "../models/Event.js";

// ➕ Create Event
export const createEvent = async (req, res) => {
  try {
    const { name, title, description, priceRange, icon } = req.body;
    
    // If frontend sends minPrice/maxPrice separately
    let finalPriceRange = priceRange;
    if (req.body.minPrice !== undefined && req.body.maxPrice !== undefined) {
      finalPriceRange = {
        min: req.body.minPrice,
        max: req.body.maxPrice,
      };
    }

    const event = await Event.create({
      name,
      title,
      description,
      icon,
      priceRange: finalPriceRange,
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
    const { name, title, description, priceRange, minPrice, maxPrice, icon } = req.body;
    
    // Handle both formats
    let finalPriceRange = priceRange;
    if (minPrice !== undefined || maxPrice !== undefined) {
      finalPriceRange = {
        min: minPrice !== undefined ? minPrice : priceRange?.min,
        max: maxPrice !== undefined ? maxPrice : priceRange?.max,
      };
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        name,
        title,
        description,
        icon,
        priceRange: finalPriceRange,
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