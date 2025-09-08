import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    profession: { type: String, enum: ["Beautician", "Makeup Artist", "Massage Therapist"], required: true },
    avatar: String,
    partnerId: { type: String, unique: true },
    password: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    dutyStatus: { type: Boolean, default: false },
    stepStatus: {
      profileSetup: { type: Boolean, default: false },
      documents: { type: Boolean, default: false },
      bankInfo: { type: Boolean, default: false },
      approval: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

partnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

partnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Partner", partnerSchema);
