import express from "express";
import multer from "multer";
import {
  createVariety,
  getVarieties,
  updateVariety,
  deleteVariety,
} from "../controllers/varietyController.js";
//
const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("image"), createVariety);
router.get("/", getVarieties);
router.put("/:id", upload.single("image"), updateVariety);
router.delete("/:id", deleteVariety);

export default router;
