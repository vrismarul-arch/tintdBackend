import jwt from "jsonwebtoken";
import Partner from "../../models/partners/Partner.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Login
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
    token: generateToken(partner._id), // ✅ make sure this is _id
  });
};

// Get profile
export const getPartnerProfile = async (req, res) => {
  const partner = await Partner.findById(req.partner._id).select("-password");
  if (!partner) return res.status(404).json({ error: "Partner not found" });
  res.json(partner);
};
