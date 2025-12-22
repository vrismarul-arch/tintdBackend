import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import ComboPackage from "../models/ComboPackage.js";
import Partner from "../models/partners/Partner.js";
import Notification from "../models/partners/Notification.js";
import { sendPushNotification } from "../utils/pushNotification.js";

/* ======================================================
   GET ADMIN BOOKING BY ID (FULL POPULATE)
====================================================== */
export const getAdminBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "items.service",
        select: "name price imageUrl",
      })
      .populate({
        path: "items.combo",
        select: "title price originalPrice discount",
        populate: {
          path: "services",
          select: "name price imageUrl",
        },
      })
      .populate("user", "name email phone")
      .populate("assignedTo", "name email phone");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   CREATE BOOKING (COD / DIRECT)
====================================================== */
export const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      location,
      items,
      totalAmount,
      selectedDate,
      selectedTime,
      paymentMethod,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !items ||
      items.length === 0 ||
      !selectedDate ||
      !selectedTime ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    for (const item of items) {
      if (item.itemType === "service") {
        const service = await Service.findById(item.service);
        if (!service) {
          return res.status(400).json({ error: "Invalid service item" });
        }
      }

      if (item.itemType === "combo") {
        const combo = await ComboPackage.findById(item.combo);
        if (!combo) {
          return res.status(400).json({ error: "Invalid combo item" });
        }
      }
    }

    const booking = new Booking({
      user: req.user?._id || null,
      name,
      email,
      phone,
      address,
      location,
      items,
      totalAmount,
      selectedDate,
      selectedTime,
      paymentMethod,
      status: "confirmed",
      orderStatus: paymentMethod === "cod" ? "unpaid" : "paid",
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("items.service", "name price imageUrl")
      .populate({
        path: "items.combo",
        select: "title price originalPrice discount",
        populate: {
          path: "services",
          select: "name price imageUrl",
        },
      })
      .populate("user", "name email phone");

    const partners = await Partner.find({ dutyStatus: true });

    for (const partner of partners) {
      const text = `New booking ${booking.bookingId} available`;

      await Notification.create({
        partner: partner._id,
        booking: booking._id,
        text,
      });

      if (partner.pushToken) {
        await sendPushNotification(partner.pushToken, {
          title: "New Booking Available",
          body: text,
          data: { bookingId: booking._id.toString() },
        });
      }
    }

    res.status(201).json({
      success: true,
      booking: populatedBooking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   USER BOOKINGS
====================================================== */
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ user: req.user._id }, { user: null, email: req.user.email }],
    })
      .populate("items.service", "name price imageUrl")
      .populate({
        path: "items.combo",
        select: "title price",
        populate: { path: "services", select: "name price imageUrl" },
      })
      .populate("assignedTo", "name phone email");

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error("Get user bookings error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   ADMIN – GET ALL BOOKINGS
====================================================== */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("items.service", "name price imageUrl")
      .populate({
        path: "items.combo",
        select: "title price",
        populate: { path: "services", select: "name price imageUrl" },
      })
      .populate("user", "name email phone")
      .populate("assignedTo", "name email phone");

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   UPDATE BOOKING STATUS (ADMIN) ✅ FIXED
====================================================== */
export const updateBooking = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (status) {
      booking.status = status;

      // ✅ AUTO PAID ONLY FOR ONLINE PAYMENTS
      if (
        status === "confirmed" &&
        booking.paymentMethod !== "cod" &&
        booking.orderStatus !== "paid"
      ) {
        booking.orderStatus = "paid";
      }
    }

    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   USER CANCEL BOOKING
====================================================== */
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ error: "Cancel reason is required" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (
      booking.user &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    if (booking.status === "completed") {
      return res
        .status(400)
        .json({ error: "Completed bookings cannot be cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelReason = reason;
    booking.cancelledAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   DELETE BOOKING
====================================================== */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   PARTNER PICKS BOOKING
====================================================== */
export const pickOrder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.assignedTo) {
      return res.status(400).json({ error: "Booking already picked" });
    }

    booking.assignedTo = req.partner._id;
    booking.status = "picked";

    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Pick order error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   PARTNER CONFIRM BOOKING
====================================================== */
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Confirm booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   MARK ORDER AS PAID (FOR COD AFTER SERVICE)
====================================================== */
export const markOrderPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.orderStatus = "paid";
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Mark paid error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   COMPLETE BOOKING (ONLY IF PAID)
====================================================== */
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.orderStatus !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Complete booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   ASSIGN PARTNER (ADMIN)
====================================================== */
export const assignPartnerToBooking = async (req, res) => {
  try {
    const { partnerId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    booking.assignedTo = partnerId;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("items.service", "name price imageUrl")
      .populate({
        path: "items.combo",
        select: "title price",
        populate: { path: "services", select: "name price imageUrl" },
      })
      .populate("assignedTo", "name email phone");

    res.status(200).json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("Assign partner error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   FIX OLD BOOKINGS
====================================================== */
export const fixOldBookings = async (req, res) => {
  try {
    const updated = await Booking.updateMany(
      { user: null, email: req.user.email },
      { $set: { user: req.user._id } }
    );

    res.status(200).json({
      success: true,
      modifiedCount: updated.modifiedCount,
    });
  } catch (err) {
    console.error("Fix old bookings error:", err);
    res.status(500).json({ error: err.message });
  }
};
