// routes/bookingRoutes.js
import express from "express";
import { createBooking, getBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", getBookings); // admin maybe
router.get("/my", protect, getUserBookings);

export default router;
