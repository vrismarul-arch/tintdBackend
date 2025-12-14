// models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
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
    min: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Cart ||
  mongoose.model("Cart", cartSchema);
