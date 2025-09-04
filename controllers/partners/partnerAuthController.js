import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import Partner from "../../models/partners/Partner.js";
import supabase from "../../config/supabase.js";

// =============================
// 📌 Multer Setup
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
// 📌 JWT Token
// =============================
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// =============================
// 📌 Login Partner
// =============================
export const loginPartner = async (req, res) => {
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
    role: "partner",
    token: generateToken(partner._id),
  });
};

// =============================
// 📌 Get Profile
// =============================
export const getPartnerProfile = async (req, res) => {
  const partner = await Partner.findById(req.partner._id).select("-password");
  if (!partner) return res.status(404).json({ error: "Partner not found" });
  res.json(partner);
};

// =============================
// 📌 Update Partner
// =============================
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    let updates = { ...req.body };

    // ❌ Ensure partnerId & status cannot be edited
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

    res.json(partner);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
