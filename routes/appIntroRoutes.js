import express from "express";
import {
  getAppIntro,
  confirmAppIntro,
  resetAppIntro,
  addAppIntroConfig,
} from "../controllers/appIntroController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================
   USER
========================= */
router.get("/", protect, getAppIntro);
router.post("/confirm", protect, confirmAppIntro);

/* =========================
   ADMIN
========================= */
router.post(
  "/admin/config",
  protect,
  admin,
  upload.any(), // 🔥 REQUIRED
  addAppIntroConfig
);

router.post("/admin/reset", protect, admin, resetAppIntro);

export default router;
