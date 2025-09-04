import express from "express";
import { getAllPartners, approvePartner, rejectPartner } from "../../controllers/partners/adminPartnerController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getAllPartners);
router.put("/:id/approve", protect, admin, approvePartner);
router.put("/:id/reject", protect, admin, rejectPartner);

export default router;
