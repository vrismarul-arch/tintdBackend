// ✅ Variety.js
import mongoose from "mongoose";

const varietySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. Glow Facial, Power Pack
    description: String,
    imageUrl: String,
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true }, // parent subcategory
  },
  { timestamps: true }
);

export default mongoose.model("Variety", varietySchema);
