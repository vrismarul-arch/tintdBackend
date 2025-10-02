// controllers/partners/notificationController.js
import Booking from "../../models/Booking.js";

// Fetch notifications for logged-in partner
export const getPartnerNotifications = async (req, res) => {
  try {
    const partnerId = req.partner._id;

    // Only bookings assigned to this partner and still pending acceptance
    const bookings = await Booking.find({ 
      assignedTo: partnerId,
      status: "confirmed" // only newly assigned, not yet accepted/picked
    })
      .populate("services.serviceId", "name price imageUrl")
      .populate("user", "name email phone");

    const notifications = bookings.map((b) => ({
      id: b._id,
      bookingId: b._id,
      booking: b,
      text: `Booking ${b.bookingId || b._id} has been assigned to you`,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: err.message });
  }
};
