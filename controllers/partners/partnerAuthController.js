import jwt from "jsonwebtoken";
import multer from "multer";
import Partner from "../../models/partners/Partner.js";
import supabase from "../../config/supabase.js";

// =============================
// 📌 Multer Setup (store in memory before upload to Supabase)
// =============================
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// =============================
// 📌 Supabase Upload Helper
// =============================
const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage
    .from("tintd")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw error;

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/tintd/${fileName}`;
};

// =============================
// 📌 JWT Token Helper
// =============================
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// =============================
// 📌 Login Partner
// =============================
export const loginPartner = async (req, res) => {
  try {
    const { partnerId, email, password } = req.body;

    const partner = partnerId
      ? await Partner.findOne({ partnerId })
      : await Partner.findOne({ email });

    if (!partner) return res.status(401).json({ error: "Invalid credentials" });
    if (partner.status !== "approved")
      return res.status(403).json({ error: "Partner not approved" });

    const isMatch = await partner.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      _id: partner._id,
      partnerId: partner.partnerId,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      status: partner.status,
      dutyStatus: partner.dutyStatus,
      avatar: partner.avatar || null,
      role: "partner",
      token: generateToken(partner._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// 📌 Get Partner Profile
// =============================
export const getPartnerProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id).select("-password");
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    res.json({
      _id: partner._id,
      partnerId: partner.partnerId,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      city: partner.city,
      gender: partner.gender,
      profession: partner.profession,
      experience: partner.experience,
      status: partner.status,
      dutyStatus: partner.dutyStatus,
      avatar: partner.avatar || null,
      dob: partner.dob,
      bankName: partner.bankName,
      accountNumber: partner.accountNumber,
      ifsc: partner.ifsc,
      aadhaarFront: partner.aadhaarFront,
      aadhaarBack: partner.aadhaarBack,
      pan: partner.pan,
      professionalCert: partner.professionalCert,
      stepStatus: partner.stepStatus || {},
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// 📌 Update Partner
// =============================
// controllers/partners/partnerController.js
// controllers/partners/partnerController.js
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    const protectedFields = ["partnerId", "status", "_id", "createdAt"];

    // -----------------------
    // Update text fields from body
    // -----------------------
    Object.keys(req.body).forEach((key) => {
      if (!protectedFields.includes(key)) {
        // Handle DOB properly
        if (key === "dob" && req.body.dob) {
          partner.dob = new Date(req.body.dob);
        } else {
          partner[key] = req.body[key];
        }
      }
    });

    // -----------------------
    // Update uploaded files
    // -----------------------
    if (req.files) {
      for (const key in req.files) {
        if (req.files[key][0]) {
          partner[key] = await uploadToSupabase(req.files[key][0]);
        }
      }
    }

    // -----------------------
    // Save partner
    // -----------------------
    await partner.save();

    // -----------------------
    // Return updated partner object (all fields properly formatted)
    // -----------------------
    res.json({
      _id: partner._id,
      partnerId: partner.partnerId,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      city: partner.city,
      gender: partner.gender,
      profession: partner.profession,
      experience: partner.experience,
      status: partner.status,
      dutyStatus: partner.dutyStatus,
      avatar: partner.avatar || null,
      dob: partner.dob ? partner.dob.toISOString().split("T")[0] : null,
      bankName: partner.bankName,
      accountNumber: partner.accountNumber,
      ifsc: partner.ifsc,
      aadhaarFront: partner.aadhaarFront,
      aadhaarBack: partner.aadhaarBack,
      pan: partner.pan,
      professionalCert: partner.professionalCert,
      stepStatus: partner.stepStatus || {},
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};



// =============================
// 📌 Toggle Duty ON/OFF
// =============================
export const toggleDuty = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    partner.dutyStatus = !partner.dutyStatus;
    await partner.save();

    res.json({ dutyStatus: partner.dutyStatus });
  } catch (error) {
    console.error("Duty toggle error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
