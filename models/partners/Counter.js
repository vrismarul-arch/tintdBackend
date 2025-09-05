import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "partnerId"
  seq: { type: Number, default: 0 }, // auto-increment value
});

export default mongoose.model("Counter", counterSchema);
