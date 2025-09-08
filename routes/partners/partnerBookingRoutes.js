import express from "express";
import { partnerProtect } from "../../middleware/partnerAuthMiddleware.js";
import {
  pickBooking,
  confirmBooking,
  completeBooking,
  rejectBooking,getPartnerOrderHistory
} from "../../controllers/partners/partnerBookingController.js";

const router = express.Router();

// Pick a booking
router.put("/:id/pick", partnerProtect, pickBooking);

// Confirm a booking
router.put("/:id/confirm", partnerProtect, confirmBooking);

// Complete a booking
router.put("/:id/complete", partnerProtect, completeBooking);

// Reject a booking
router.put("/:id/reject", partnerProtect, rejectBooking);
router.get("/history", partnerProtect, getPartnerOrderHistory);
export default router;
