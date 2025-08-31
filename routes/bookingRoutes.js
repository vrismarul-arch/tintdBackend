import express from "express";
import { 
  createBooking, 
  getUserBookings, 
  deleteBooking, 
  fixOldBookings 
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Create a booking (COD / Online)
router.post("/", protect, createBooking);

// 🟢 Get logged-in user's bookings
router.get("/my", protect, getUserBookings);

// 🟢 Delete a booking
router.delete("/:id", protect, deleteBooking);

// 🟢 Fix old bookings with null user
router.post("/fix-old", protect, fixOldBookings);

export default router;
