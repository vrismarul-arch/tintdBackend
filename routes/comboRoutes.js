// routes/comboRoutes.js
import express from "express";
import {
  createCombo,
  updateCombo,
  getCombos,
  getComboById,
  deleteCombo,
  getCombosByIds,
} from "../controllers/comboController.js";

const router = express.Router();

router.post("/byIds", getCombosByIds); // 🔥 REQUIRED
router.post("/", createCombo);
router.get("/", getCombos);
router.get("/:id", getComboById);
router.put("/:id", updateCombo);
router.delete("/:id", deleteCombo);

export default router;
