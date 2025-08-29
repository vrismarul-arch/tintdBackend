import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  googleLogin,   // ✅ import this
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/google", googleLogin);   // ✅ add this line
router.get("/auth/profile", protect, getProfile);

export default router;
