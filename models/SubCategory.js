// ✅ SubCategory.js
import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. Facial, Waxing
    description: String,
    imageUrl: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // parent category
  },
  { timestamps: true }
);

export default mongoose.model("SubCategory", subCategorySchema);
