import jwt from "jsonwebtoken";
import Partner from "../models/partners/Partner.js";

export const partnerProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      // VERIFY JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // FETCH USER
      const partner = await Partner.findById(decoded.id).select("-password");
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }

      req.partner = partner;
      next();

    } catch (error) {
      console.error("Auth error:", error);

      // EXPIRED TOKEN
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }

      // INVALID TOKEN
      return res.status(401).json({ error: "Invalid token" });
    }

  } else {
    return res.status(401).json({ error: "No token provided" });
  }
};
