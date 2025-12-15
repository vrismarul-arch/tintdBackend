import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ["Home", "Work", "Personal"],
      required: true,
    },
    fullAddress: { type: String, required: true },

    house: String,
    street: String,
    area: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    location: {
      lat: Number,
      lng: Number,
    },

    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,

    addresses: [addressSchema], // ✅ MULTIPLE ADDRESSES

    avatar: {
      type: String,
      default:
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
