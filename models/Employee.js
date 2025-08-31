import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    avatar: {
      type: String,
      default:
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
    role: { type: String, enum: ["employee"], default: "employee" },
    specialization: { type: String }, // Hair stylist, Spa, etc.
    shift: { type: String },          // Morning, Evening
    salary: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
