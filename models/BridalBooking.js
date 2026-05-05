import mongoose from "mongoose";

const bridalBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: false,
      lowercase: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    makeup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Makeup",
    },

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

    totalPrice: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ IMPORTANT CHANGE
const BridalBooking = mongoose.model("BridalBooking", bridalBookingSchema);

export default BridalBooking;