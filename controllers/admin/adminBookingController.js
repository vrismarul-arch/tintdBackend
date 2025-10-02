import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import Payment from "../../models/Payment.js";

// ✅ Get all bookings (with display bookingId like BK-0001)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
    //   .populate("assignedTo", "name email")
      .populate("services.serviceId", "name price imageUrl")
      .lean();

    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({
      booking: { $in: bookingIds },
    }).lean();

    const bookingsWithPayment = bookings.map((b, index) => {
      const payment = payments.find(
        (p) => String(p.booking) === String(b._id)
      );
      return {
        ...b,
        bookingId: `BK-${String(index + 1).padStart(4, "0")}`, // 👈 for display
        payment: payment
          ? {
              orderId: payment.orderId,
              paymentId: payment.paymentId,
              status: payment.status,
              method: payment.method || "N/A",
              amount: payment.amount,
              currency: payment.currency,
              createdAt: payment.createdAt,
            }
          : null,
      };
    });

    res.status(200).json({ bookings: bookingsWithPayment });
  } catch (err) {
    console.error("Failed to fetch all bookings:", err);
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};



// ✅ Update booking
export const updateBookingAdmin = async (req, res) => {
    try {
        const { id } = req.params;
    const { status, assignedTo } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ error: "Invalid booking ID" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    if (status) booking.status = status;
    if (assignedTo) booking.assignedTo = assignedTo;
    
    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
} catch (err) {
    console.error("Failed to update booking:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete booking
export const deleteBookingAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid booking ID" });
    
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully" });
} catch (err) {
    console.error("Failed to delete booking:", err);
    res.status(500).json({ error: "Internal server error" });
}
};
// ✅ Get single booking
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate("services.serviceId")
    //   .populate("assignedTo"); // <-- This is where Employee is used

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
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
