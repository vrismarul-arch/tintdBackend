import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🟢 Create Order
export const createOrder = async (req, res) => {
  try {
    console.log("👉 Request body:", req.body);
    const { amount, bookingData, userId } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Amount is required and must be a number" });
    }

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order:", order);

    await Payment.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingData,
      user: userId || null,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Update payment status
      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "paid",
        },
        { new: true }
      );

      // Create Booking
      const booking = new Booking({
        ...bookingData,
        paymentMethod: "razorpay",
        status: "confirmed",
      });
      await booking.save();

      payment.booking = booking._id;
      await payment.save();

      return res.json({ success: true, message: "Payment verified", booking });
    } else {  
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("❌ Verify error:", err);
    res.status(500).json({ error: err.message });
  }
};
