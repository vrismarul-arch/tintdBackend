// ✅ Service.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    originalPrice: { type: Number, required: true },
    price: { type: Number, required: true },   // Final price after discount
    discount: { type: Number, default: 0 },    // Discount %
    duration: { type: Number, required: true }, // in minutes

    // Relations
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
    variety: { type: mongoose.Schema.Types.ObjectId, ref: "Variety", required: true },

    imageUrl: String,
  },
  { timestamps: true }
);

// Virtual field for auto-calculating % discount
serviceSchema.virtual("calculatedDiscount").get(function () {
  if (!this.originalPrice || !this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Service", serviceSchema);
