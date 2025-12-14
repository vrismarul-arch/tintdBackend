import Booking from "../../models/Booking.js";
import Partner from "../../models/partners/Partner.js";

/* =============================
   Get available bookings
   (pending + not assigned)
============================= */
export const getAvailableBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "pending",
      assignedTo: null,
    })
      .populate("items.service", "name price imageUrl")
      .populate("items.combo", "title price services")
      .populate("user", "name email phone");

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available bookings" });
  }
};

/* =============================
   Partner picks a booking
============================= */
export const pickBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const partnerId = req.partner._id;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    if (booking.assignedTo)
      return res.status(400).json({ error: "Booking already picked" });

    booking.assignedTo = partnerId;
    booking.status = "picked";

    await booking.save();

    res.json({
      success: true,
      message: "Booking picked successfully",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   Partner confirms booking
============================= */
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    if (
      booking.assignedTo?.toString() !== req.partner._id.toString()
    ) {
      return res.status(403).json({ error: "Not your booking" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({
      success: true,
      message: "Booking confirmed",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   Partner completes booking
============================= */
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ error: "Booking must be confirmed before completing" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({
      success: true,
      message: "Booking completed successfully",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   Partner order history
============================= */
export const getPartnerOrderHistory = async (req, res) => {
  try {
    const partnerId = req.partner._id;

    const bookings = await Booking.find({ assignedTo: partnerId })
      .populate("items.service", "name price imageUrl")
      .populate("items.combo", "title price services")
      .populate("user", "name email phone");

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
};
