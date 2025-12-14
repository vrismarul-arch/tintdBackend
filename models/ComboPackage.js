import mongoose from "mongoose";

const comboPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    subtitle: String,
    description: String,

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],

    originalPrice: Number,

    price: {
      type: Number,
      required: true,
    },

    discount: Number,
    duration: Number,

    btnText: {
      type: String,
      default: "Book Now",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ComboPackage", comboPackageSchema);
