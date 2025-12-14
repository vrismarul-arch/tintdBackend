import express from "express";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import { getPartnerNotifications } from "../../controllers/partners/notificationController.js";

const router = express.Router();

// GET partner notifications
router.get("/", partnerProtect, getPartnerNotifications);

export default router;
