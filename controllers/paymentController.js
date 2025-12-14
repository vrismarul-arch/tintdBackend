import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =============================
// Create Razorpay order
// =============================
export const createOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ error: "Total amount is required" });
    }

    const options = {
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      user: req.user?._id || null,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =============================
// Verify Razorpay payment + Create Booking
// =============================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    if (!bookingData) {
      return res.status(400).json({ error: "Booking data missing" });
    }

    // 🔐 Verify signature
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" }
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // ✅ Mark payment as PAID
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    // ✅ Create booking (USING ITEMS)
    const booking = new Booking({
      user: bookingData.userId || null,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      address: bookingData.address,
      location: bookingData.location,

      items: bookingData.items, // ✅ FIXED (NOT services)

      totalAmount: bookingData.totalAmount,
      selectedDate: bookingData.selectedDate,
      selectedTime: bookingData.selectedTime,
      paymentMethod: "razorpay",
      status: "confirmed",
    });

    await booking.save();

    // 🔗 Link booking to payment
    payment.booking = booking._id;
    payment.bookingData = bookingData;
    await payment.save();

    return res.json({
      success: true,
      booking,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =============================
// Cash on Delivery Booking
// =============================
export const createCODBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      location,
      items,
      totalAmount,
      userId,
      selectedDate,
      selectedTime,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !items ||
      items.length === 0 ||
      !selectedDate ||
      !selectedTime
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const booking = new Booking({
      user: userId || null,
      name,
      email,
      phone,
      address,
      location,

      items, // ✅ FIXED

      totalAmount,
      paymentMethod: "cod",
      selectedDate,
      selectedTime,
      status: "confirmed",
    });

    await booking.save();

    res.json({
      success: true,
      booking,
    });
  } catch (err) {
    console.error("COD booking error:", err);
    res.status(500).json({ error: err.message });
  }
};
