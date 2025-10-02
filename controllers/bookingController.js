import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Partner from "../models/partners/Partner.js";
import Notification from "../models/partners/Notification.js";
import { sendPushNotification } from "../utils/pushNotification.js";

// =========================
// Create a new booking
// =========================
export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, address, location, services, totalAmount, selectedDate, selectedTime, paymentMethod } = req.body;

    if (!name || !email || !phone || !address || !services || !selectedDate || !selectedTime || !paymentMethod)
      return res.status(400).json({ error: "All fields are required" });

    const serviceIds = services.map(s => s.serviceId);
    const fetchedServices = await Service.find({ _id: { $in: serviceIds } });
    if (fetchedServices.length !== services.length)
      return res.status(400).json({ error: "Some services are invalid" });

    const booking = new Booking({
      user: req.user?._id || null,
      name, email, phone, address, location,
      services, totalAmount, selectedDate, selectedTime, paymentMethod,
    });

    await booking.save();

    // Notify duty-on partners and save notifications
    const availablePartners = await Partner.find({ dutyStatus: true });

    for (let partner of availablePartners) {
      const text = `New booking ${booking.bookingId || booking._id} is available`;
      
      // Save notification in DB
      const notification = new Notification({
        partner: partner._id,
        booking: booking._id,
        text
      });
      await notification.save();

      // Send push notification if available
      if (partner.pushToken) {
        await sendPushNotification(partner.pushToken, {
          title: "New Order Available",
          body: text,
          data: { bookingId: booking._id.toString() },
        });
      }
    }

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// Get all available bookings for partners (not picked)
// =========================
export const getAvailableBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending", assignedTo: null });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// Partner picks a booking
// =========================
export const pickOrder = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const partnerId = req.partner._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.assignedTo) return res.status(400).json({ error: "Already picked by another partner" });

    booking.assignedTo = partnerId;
    booking.status = "picked";
    await booking.save();

    res.json({ message: "Order picked successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// =========================
// Get logged-in user's bookings with assigned partner details
// =========================
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { user: req.user._id },
        { user: null, email: req.user.email },
      ]
    })
      .populate("services.serviceId", "name price imageUrl") // populate service info
  .populate("assignedTo", "name email phone avatar");
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// =========================
// Get all bookings (admin)
// =========================
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("services.serviceId", "name price imageUrl")
      .populate("user", "name email phone")
      .populate("assignedTo", "name email phone");

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// Update booking (status / assign partner)
// =========================
export const updateBooking = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (status) booking.status = status;

    if (assignedTo) {
      const partner = await Partner.findById(assignedTo);
      if (!partner) return res.status(400).json({ error: "Invalid partner ID" });
      booking.assignedTo = assignedTo;
    }

    await booking.save();
    res.json({ message: "Booking updated successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// Delete a booking
// =========================
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

// =========================
// Optional: Fix old bookings with null user
// =========================
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


// =========================
// Complete a booking
// =========================
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Booking must be confirmed before completing" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking completed successfully", booking });
  } catch (err) {
    console.error("Complete booking error:", err);
    res.status(500).json({ error: err.message });
  }
};
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "confirmed";
    booking.assignedTo = req.partner._id;
    await booking.save();

    res.json({ message: "Booking confirmed", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Partner rejects booking
export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Booking rejected", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get partner notifications
export const getPartnerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ partner: req.partner._id })
      .populate("booking")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
