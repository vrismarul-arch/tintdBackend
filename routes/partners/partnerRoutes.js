import express from "express";
import {
  loginPartner,
  getPartnerProfile,
  updatePartner,
  toggleDuty,
} from "../../controllers/partners/partnerController.js";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import { upload } from "../../controllers/partners/partnerController.js";

const router = express.Router();

router.post("/login", loginPartner);
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

// ✅ Duty toggle route
router.put("/duty", partnerProtect, toggleDuty);

export default router;
