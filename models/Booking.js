// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: String,
    email: String,
    phone: String,
    address: String,

    location: {
      lat: Number,
      lng: Number,
    },

    // 🔥 SAME STRUCTURE AS CART
    items: [
      {
        itemType: {
          type: String,
          enum: ["service", "combo"],
          required: true,
        },

        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },

        combo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ComboPackage",
        },

        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    totalAmount: Number,
    selectedDate: Date,
    selectedTime: String,

    paymentMethod: String,
orderStatus: {
  type: String,
  enum: [
    "unpaid",
    "paid",
    "refunded",
  ],
  default: "unpaid",
},
    status: {
      type: String,
      enum: ["pending", "picked", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto booking id
bookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const last = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    const nextNo = last?.bookingId
      ? parseInt(last.bookingId.split("-")[1]) + 1
      : 1;

    this.bookingId = `tind-${String(nextNo).padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("Booking", bookingSchema);
