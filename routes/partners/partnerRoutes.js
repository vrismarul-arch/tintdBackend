import express from "express";
import {
  loginPartner,
  getPartnerProfile,
  updatePartner,
  upload,
} from "../../controllers/partners/partnerAuthController.js";

import {
  forgotPartnerPassword,
  verifyPartnerResetOtp,
  resetPartnerPasswordOtp,
} from "../../controllers/partners/partnerPasswordController.js";

import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";

const router = express.Router();

// 🔐 AUTH
router.post("/login", loginPartner);

// 🔁 OTP PASSWORD RESET
router.post("/forgot-password", forgotPartnerPassword);
router.post("/verify-reset-otp", verifyPartnerResetOtp);
router.post("/reset-password-otp", resetPartnerPasswordOtp);

// 👤 PROFILE
router.get("/profile", partnerProtect, getPartnerProfile);

router.put(
  "/update",
  partnerProtect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "professionalCert", maxCount: 1 },
  ]),
  updatePartner
);

export default router;
