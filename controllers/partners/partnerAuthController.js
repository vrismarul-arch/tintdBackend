import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import Partner from "../../models/partners/Partner.js";

/**
 * @desc   Send OTP to partner mobile number
 * @route  POST /api/partners/send-otp
 * @access Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    // Find or create partner
    let partner = await Partner.findOne({ phone });
    if (!partner) partner = await Partner.create({ phone });

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    partner.otp = otp;
    partner.otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await partner.save();

    // TODO: integrate SMS provider
    console.log(`✅ OTP for ${phone}: ${otp}`);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

/**
 * @desc   Verify OTP for partner
 * @route  POST /api/partners/verify-otp
 * @access Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

    const partner = await Partner.findOne({ phone });
    if (!partner) return res.status(400).json({ message: "Partner not found" });

    if (partner.otp !== otp || partner.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP verified
    partner.isVerified = true;
    partner.otp = null;
    partner.otpExpiresAt = null;
    await partner.save();

    // Issue JWT
    const token = jwt.sign(
      { id: partner._id, phone: partner.phone, role: partner.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, message: "OTP verified successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to verify OTP", error: error.message });
  }
};
