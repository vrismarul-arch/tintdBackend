// controllers/partners/notificationController.js
import Booking from "../../models/Booking.js";

// ===============================
// Fetch notifications for partner
// ===============================
export const getPartnerNotifications = async (req, res) => {
  try {
    const partnerId = req.partner._id;

    // 🔔 Bookings assigned to this partner but not completed
    const bookings = await Booking.find({
      assignedTo: partnerId,
      status: { $in: ["picked", "confirmed"] },
    })
      .populate("items.service", "name price imageUrl")
      .populate("items.combo", "title price services")
      .populate("user", "name email phone");

    const notifications = bookings.map((b) => ({
      id: b._id,
      bookingId: b.bookingId || b._id,
      booking: b,
      text: `New booking ${b.bookingId || b._id} assigned to you`,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: err.message });
  }
};
