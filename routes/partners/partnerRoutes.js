import express from "express";
import { loginPartner, getPartnerProfile } from "../../controllers/partners/partnerAuthController.js";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";

const router = express.Router();

// Public login
router.post("/login", loginPartner);

// Protected profile
router.get("/profile", partnerProtect, getPartnerProfile);

export default router;
