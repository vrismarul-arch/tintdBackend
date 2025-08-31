import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: String,
    email: String,
    phone: String,
    address: String,
    location: { lat: Number, lng: Number },
    services: [{ serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" }, quantity: Number }],
    totalAmount: Number,
    selectedDate: { type: Date, required: true },
    selectedTime: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  },
  { timestamps: true }
);

bookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastBooking = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextId = 1;
    if (lastBooking && lastBooking.bookingId) {
      const lastId = parseInt(lastBooking.bookingId.split("-")[1], 10);
      nextId = lastId + 1;
    }
    this.bookingId = `tind-${String(nextId).padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("Booking", bookingSchema);
