import jwt from "jsonwebtoken";
import Partner from "../models/partners/Partner.js";

export const partnerProtect = async (req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const partner = await Partner.findById(decoded.id).select("-password");
    if (!partner) return res.status(401).json({ error: "Partner not found" });

    req.partner = partner; // ✅ attach partner here
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
