import express from "express";
import { registerUser, loginUser, googleLogin, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/profile", protect, getProfile);

export default router;
/* sadesgghf */