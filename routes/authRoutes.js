// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  googleLogin,   // ✅ import
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Email/Password auth
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);

// ✅ Google login route
router.post("/auth/google", googleLogin);

// Protected route
router.get("/auth/profile", protect, getProfile);

export default router;
