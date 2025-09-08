import jwt from "jsonwebtoken";
import Partner from "../models/partners/Partner.js";

/**
 * Middleware to protect routes for partners.
 * Verifies JWT token and attaches the partner to `req.partner`.
 */
export const partnerProtect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch partner from DB
      const partner = await Partner.findById(decoded.id).select("-password");
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }

      req.partner = partner; // attach partner to request
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};
