import mongoose from "mongoose";

const eventSplashSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    subtitle: {
      type: String,
    },

    image: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    schedule: {
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EventSplash", eventSplashSchema);
