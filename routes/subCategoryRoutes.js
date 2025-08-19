import express from "express";
import multer from "multer";
import {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("image"), createSubCategory);
router.get("/", getSubCategories);
router.put("/:id", upload.single("image"), updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;
