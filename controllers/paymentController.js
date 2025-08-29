import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 👉 Create order for frontend
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount) return res.status(400).json({ error: "Amount required" });

    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay order error:", err.message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// 👉 (Optional) verify payment webhook from Razorpay
export const verifyPayment = async (req, res) => {
  try {
    // todo: verify signature if you enable webhook
    res.json({ status: "ok" });
  } catch (err) {
    res.status(400).json({ error: "Invalid payment verification" });
  }
};
