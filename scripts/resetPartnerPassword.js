import mongoose from "mongoose";
import dotenv from "dotenv";
import Partner from "../models/partners/Partner.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const partner = await Partner.findOne({
      email: "arulupsc@gmail.com",
    });

    if (!partner) {
      console.log("❌ Partner not found");
      process.exit();
    }

    partner.password = "tintd@123456"; // 👈 plain password
    await partner.save(); // 🔥 model pre-save hash

    console.log("✅ Password reset successful");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
