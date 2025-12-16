import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
  fixOldBookings,
  pickOrder,
  confirmBooking,
  completeBooking, cancelBooking
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getUserBookings);
router.get("/admin", protect, getAllBookings);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);
router.post("/fix-old", protect, fixOldBookings);
router.patch("/:id/cancel", protect, cancelBooking);


// ✅ New booking action routes
router.put("/:id/pick", protect, pickOrder);
router.put("/:id/confirm", protect, confirmBooking);
router.put("/:id/complete", protect, completeBooking);

// ✅ Add this route if you want to support "approve" path from frontend
router.put("/:id/approve", protect, confirmBooking);

export default router;
