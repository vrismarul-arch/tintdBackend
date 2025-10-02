import Booking from "../models/Booking.js";
import Partner from "../models/partners/Partner.js"; // ✅ Import Partner

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("services.serviceId", "name price")
      .populate("user", "name email phone")
      .populate("assignedTo", "name email phone"); // populate assigned partner

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("services.serviceId", "name price")
      .populate("assignedTo", "name email phone"); // populate partner

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: "Server error fetching booking details" });
  }
};

// Update booking status
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (status) booking.status = status;

    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("services.serviceId", "name price")
      .populate("user", "name email phone")
      .populate("assignedTo", "name email phone"); // populate partner

    res.json({ message: "Booking updated", booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || null,
      role: req.user.role || "admin",
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// =========================
// Assign Partner to Booking
// =========================
export const assignPartnerToBooking = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const bookingId = req.params.id;

    if (!partnerId) return res.status(400).json({ error: "partnerId is required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    // ✅ Only assign the partner, do NOT change the booking status
    booking.assignedTo = partnerId;

    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("services.serviceId", "name price imageUrl")
      .populate("user", "name email phone")
      .populate("assignedTo", "name email phone");

    res.json({ message: "Partner assigned successfully", booking: updatedBooking });
  } catch (err) {
    console.error("Assign partner error:", err);
    res.status(500).json({ error: err.message });
  }
};
