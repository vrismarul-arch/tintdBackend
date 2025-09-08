import express from "express";
import { getAllPartners, approvePartner, rejectPartner } from "../../controllers/partners/adminPartnerController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Admin: get all partners
router.get("/", protect, admin, getAllPartners);

// Approve partner
router.put("/:id/approve", protect, admin, approvePartner);

// Reject partner
router.put("/:id/reject", protect, admin, rejectPartner);

export default router;
