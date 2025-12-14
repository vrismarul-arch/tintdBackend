import express from "express";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import {
  getAvailableBookings,
  pickBooking,
  confirmBooking,
  completeBooking,
  getPartnerOrderHistory
} from "../../controllers/partners/partnerBookingController.js";

const router = express.Router();

/* =============================
   STATIC ROUTES FIRST
============================= */

// ✅ Partner order history
router.get("/history", partnerProtect, getPartnerOrderHistory);

// ✅ Available bookings
router.get("/available", partnerProtect, getAvailableBookings);

/* =============================
   DYNAMIC ROUTES AFTER
============================= */

router.put("/:id/pick", partnerProtect, pickBooking);
router.put("/:id/confirm", partnerProtect, confirmBooking);
router.put("/:id/complete", partnerProtect, completeBooking);

export default router;
