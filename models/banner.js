import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,

    // 🔗 Banner belongs to ONE combo
    combo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComboPackage",
      required: true,
    },

    btnText: {
      type: String,
      default: "Book Now",
    },

    imageUrl: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    schedule: {
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
