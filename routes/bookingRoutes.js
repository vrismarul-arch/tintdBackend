import express from "express";
import { 
  createBooking, 
  getUserBookings, 
  deleteBooking, 
  fixOldBookings,
  getAllBookings, // 🟢 Add this import
  updateBooking // 🟢 Add this import
} from "../controllers/bookingController.js";
import { protect, } from "../middleware/authMiddleware.js"; // 🟢 Add 'admin' middleware

const router = express.Router();

// 🟢 Create a booking (COD / Online)
router.post("/", protect, createBooking);

// 🟢 Get logged-in user's bookings
router.get("/my", protect, getUserBookings);

// 🟢 Get all bookings for admin
router.get("/admin", protect,  getAllBookings);

// 🟢 Update a booking status and assignment
router.put("/:id", protect,  updateBooking);

// 🟢 Delete a booking
router.delete("/:id", protect, deleteBooking);

// 🟢 Fix old bookings with null user
router.post("/fix-old", protect, fixOldBookings);

export default router;