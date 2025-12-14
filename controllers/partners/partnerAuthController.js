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
    .from("tintd") // 👈 bucket name
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

export const loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const partner = await Partner.findOne({ email });
    if (!partner)
      return res.status(401).json({ error: "Invalid credentials" });

    if (partner.status !== "approved")
      return res.status(403).json({ error: "Partner not approved" });

    const isMatch = await partner.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({
      _id: partner._id,
      partnerId: partner.partnerId,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      avatar: partner.avatar || null,
      role: "partner",
      token: generateToken(partner._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// 📌 Login Partner
// =============================

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
      updatedAt: partner.updatedAt, // ✅ consistent return
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// 📌 Update Partner
// =============================
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    let updates = { ...req.body };

    // ❌ Prevent editing system fields
    delete updates.partnerId;
    delete updates.status;

    // 📂 Handle file uploads
    if (req.files) {
      for (const key in req.files) {
        updates[key] = await uploadToSupabase(req.files[key][0]);
      }
    }

    Object.assign(partner, updates);
    await partner.save();

    res.json({
      _id: partner._id,
      partnerId: partner.partnerId,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      status: partner.status,
      avatar: partner.avatar || null, _id: partner._id,
      partnerId: partner.partnerId,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      city: partner.city,
      gender: partner.gender,
      profession: partner.profession,
      experience: partner.experience,
      status: partner.status,
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
      updatedAt: partner.updatedAt,// ✅ always return avatar
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
