import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Customer details
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },

    // Location (optional)
    location: {
      lat: Number,
      lng: Number,
    },

    // Services booked
    services: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        quantity: Number,
      },
    ],

    // Booking details
    selectedDate: { type: String, required: true }, // e.g. "2025-09-22"
    selectedTime: { type: String, required: true }, // e.g. "11:00 AM"
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "upi"], required: true },
    status: { type: String, default: "pending" }, // pending / confirmed / cancelled
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
