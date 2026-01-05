import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const partnerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: { type: String, unique: true },
    city: String,
    gender: String,
    profession: String,

    avatar: String,
    aadhaarFront: String,
    aadhaarBack: String,
    pan: String,
    professionalCert: String,

    bankName: String,
    accountNumber: String,
    accountHolder: String,
    ifsc: String,

    experience: { type: String, default: "fresher" },
    dob: String,

    partnerId: { type: String, unique: true },
    password: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    stepStatus: {
      profileSetup: Boolean,
      documents: Boolean,
      bankInfo: Boolean,
      approval: Boolean,
    },

    // 🔐 OTP RESET
    resetOtp: String,
    resetOtpExpire: Date,
  },
  { timestamps: true }
);

// 🔒 Hash password
partnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare password
partnerSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Partner", partnerSchema);
