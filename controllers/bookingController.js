import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      location,
      services,
      totalAmount,
      selectedDate,
      selectedTime,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !services || !selectedDate || !selectedTime || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate services exist
    const serviceIds = services.map((s) => s.serviceId);
    const fetchedServices = await Service.find({ _id: { $in: serviceIds } });
    if (fetchedServices.length !== services.length) {
      return res.status(400).json({ error: "Some services are invalid" });
    }

    const booking = new Booking({
      user: req.user._id, // attach logged-in user
      name,
      email,
      phone,
      address,
      location,
      services,
      totalAmount,
      selectedDate,
      selectedTime,
      paymentMethod,
    });

    await booking.save();
    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { user: req.user._id },
        { user: null, email: req.user.email }, // also include old bookings with user null
      ],
    }).populate("services.serviceId", "name price imageUrl");

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await booking.remove();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Fix old bookings with null user (optional)
export const fixOldBookings = async (req, res) => {
  try {
    const updated = await Booking.updateMany(
      { user: null, email: req.user.email },
      { $set: { user: req.user._id } }
    );
    res.json({ message: "Old bookings updated", modifiedCount: updated.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
