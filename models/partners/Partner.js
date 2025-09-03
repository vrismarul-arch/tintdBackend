import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  gender: { type: String, enum: ["Male","Female","Other"], required: true },
  profession: { type: String, enum: ["Beautician","Makeup Artist","Massage Therapist"], required: true },
  aadhaarFront: String,
  aadhaarBack: String,
  pan: String,
  bankName: String,
  accountNumber: String,
  ifsc: String,
  experience: { type: String, default: "fresher" },
  professionalCert: String,
  stepStatus: {
    profileSetup: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    bankInfo: { type: Boolean, default: false },
    approval: { type: Boolean, default: false },
  }
}, { timestamps: true });

export default mongoose.model("Partner", partnerSchema);
