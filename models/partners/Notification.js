import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
