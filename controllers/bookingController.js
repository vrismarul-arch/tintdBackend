import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

// Create Booking
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
      paymentMethod
    } = req.body;

    // Validate required fields
    if (
      !name || !email || !phone || !address || !location || 
      !services || !selectedDate || !selectedTime || !paymentMethod
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Populate service names & prices for validation
    const serviceIds = services.map((s) => s.serviceId);
    const fetchedServices = await Service.find({ _id: { $in: serviceIds } });

    if (fetchedServices.length !== services.length) {
      return res.status(400).json({ error: "Some services are invalid" });
    }

    const booking = new Booking({
      user: req.user?._id || null,
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

// Get all bookings (Admin)
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("services.serviceId", "name price imageUrl");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("services.serviceId", "name price imageUrl");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
