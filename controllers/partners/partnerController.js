import jwt from "jsonwebtoken";
import multer from "multer";
import Partner from "../../models/partners/Partner.js";
import supabase from "../../config/supabase.js";

// Multer setup
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Supabase upload helper
const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage
    .from("tintd")
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  if (error) throw error;
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/tintd/${fileName}`;
};

// JWT generator
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * LOGIN
 */
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
      token: generateToken(partner._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET PROFILE
 */
export const getPartnerProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id).select("-password");
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    res.json(partner);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * UPDATE PARTNER (profile + docs + duty toggle)
 */
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    let updates = { ...req.body };

    // Prevent editing system fields
    delete updates.partnerId;
    delete updates.status;

    // Handle file uploads
    if (req.files) {
      for (const key in req.files) {
        updates[key] = await uploadToSupabase(req.files[key][0]);
      }
    }

    // Handle duty toggle
    if (updates.hasOwnProperty("dutyStatus")) {
      partner.dutyStatus = updates.dutyStatus;
      delete updates.dutyStatus;
    }

    Object.assign(partner, updates);
    await partner.save();

    res.json(partner);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TOGGLE DUTY (ON/OFF)
 */
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

// Submit step data
export const submitStep = async (req, res) => {
  try {
    const { step, partnerId } = req.body;
    let data = { ...req.body };

    // Handle uploaded files
    if (req.files) {
      for (const key in req.files) {
        data[key] = await uploadToSupabase(req.files[key][0]);
      }
    }

    let partner;
    if (partnerId) {
      partner = await Partner.findById(partnerId);
      if (!partner) return res.status(404).json({ error: "Partner not found" });
      Object.assign(partner, data);
    } else {
      partner = new Partner(data);
    }

    switch(step){
      case "Step 1": partner.stepStatus.profileSetup = true; break;
      case "Step 2": partner.stepStatus.documents = true; break;
      case "Step 3": partner.stepStatus.bankInfo = true; break;
      case "Step 4": partner.stepStatus.approval = true; break;
    }

    await partner.save();
    res.status(200).json(partner);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
