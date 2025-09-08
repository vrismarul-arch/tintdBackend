import jwt from "jsonwebtoken";
import Partner from "../models/partners/Partner.js";

export const partnerProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.partner = await Partner.findById(decoded.id).select("-password");
      if (!req.partner) {
        return res.status(404).json({ error: "Partner not found" });
      }

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};
