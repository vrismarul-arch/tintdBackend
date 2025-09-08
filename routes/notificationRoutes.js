// routes/partners/notificationRoutes.js
import express from "express";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import { getPartnerNotifications } from "../../controllers/partners/notificationController.js";

const router = express.Router();

router.get("/notifications", partnerProtect, getPartnerNotifications);

export default router;
