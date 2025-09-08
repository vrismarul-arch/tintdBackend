import express from "express";
import {
  loginPartner,
  getPartnerProfile,
  updatePartner,
  toggleDuty,
  submitStep,
  getPartners,
  upload
} from "../../controllers/partners/partnerController.js";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import { getPartnerNotifications } from "../../controllers/partners/notificationController.js";

// Existing routes...

const router = express.Router();

// Partner login
router.post("/login", loginPartner);

// Get logged-in partner profile
router.get("/profile", partnerProtect, getPartnerProfile);

// Update profile, documents, etc.
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
router.get("/notifications", partnerProtect, getPartnerNotifications);
// Toggle duty ON/OFF
router.put("/duty", partnerProtect, toggleDuty);

// Submit stepwise onboarding
router.post("/submit-step", partnerProtect, upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "aadhaarFront", maxCount: 1 },
  { name: "aadhaarBack", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "professionalCert", maxCount: 1 },
]), submitStep);

// Admin: Get all partners

export default router;
