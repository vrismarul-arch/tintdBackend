import express from "express";
import multer from "multer";
import { getProfile, updateProfile, getUserBookings } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/", protect, getProfile);
router.put("/update", protect, upload.single("avatar"), updateProfile);
router.get("/bookings", protect, getUserBookings);

export default router;
