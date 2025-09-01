import express from "express";
import {
  getAllBookings,
  getBookingById,
  updateBookingAdmin,
  deleteBookingAdmin,
} from "../../controllers/admin/adminBookingController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Admin only routes
router.get("/", protect, admin, getAllBookings);
router.get("/:id", protect, admin, getBookingById); // ✅ expects _id
router.put("/:id", protect, admin, updateBookingAdmin);
router.delete("/:id", protect, admin, deleteBookingAdmin);

export default router;
