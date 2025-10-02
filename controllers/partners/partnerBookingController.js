import Booking from "../../models/Booking.js";
import Partner from "../../models/partners/Partner.js";

// =============================
// Get available bookings (not assigned yet)
// =============================
export const getAvailableBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending", assignedTo: null })
      .populate("services.serviceId", "name price imageUrl")
      .populate("user", "name email phone");
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available bookings" });
  }
};

// =============================
// Partner picks a booking
// =============================
export const pickBooking = async (req, res) => {
  try {
    const { id } = req.params; // booking ID
    const partnerId = req.partner._id;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.assignedTo) return res.status(400).json({ error: "Already picked by another partner" });

    booking.assignedTo = partnerId;
    booking.status = "picked";
    await booking.save();

    res.json({ message: "Booking picked successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =============================
// Partner confirms a booking
// =============================
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "confirmed";
    booking.assignedTo = req.partner._id;
    await booking.save();

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =============================
// Partner completes a booking
// =============================
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Booking must be confirmed before completing" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking completed successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =============================
// Partner rejects a booking
// =============================
export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Booking rejected", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =============================
// Partner order history
// =============================
export const getPartnerOrderHistory = async (req, res) => {
  try {
    const partnerId = req.partner._id; // assuming partner auth middleware sets req.partner

    const bookings = await Booking.find({ assignedTo: partnerId })
      .populate("user", "name email phone")
      .populate("services.serviceId", "name price imageUrl");

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
};
