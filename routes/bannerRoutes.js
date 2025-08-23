import express from "express";
import { upload, createBanner, getBanners, updateBanner, deleteBanner } from "../controllers/bannerController.js";

const router = express.Router();

router.post("/", upload.single("image"), createBanner);
router.get("/", getBanners);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
