import express from "express";
import {
  loginPartner,
  getPartnerProfile,
  updatePartner,
} from "../../controllers/partners/partnerAuthController.js";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import { upload } from "../../controllers/partners/partnerAuthController.js"; // ✅ bring upload here

const router = express.Router();

// Public login
router.post("/login", loginPartner);

// Protected profile
router.get("/profile", partnerProtect, getPartnerProfile);

// Update partner (with file upload)
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
