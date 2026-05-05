import express from "express";
import {
  createBridalCombo,
  getBridalCombos,
  getBridalComboById,
  updateBridalCombo,
  deleteBridalCombo,
  addItemToBridalCombo,
  removeItemFromBridalCombo,
  getActiveBridalCombos,
  toggleComboStatus,
  searchBridalCombos,
  getComboStats,
} from "../controllers/bridalComboController.js";

const router = express.Router();

// Stats and search routes (must come before :id routes)
router.get("/stats", getComboStats);
router.get("/search", searchBridalCombos);
router.get("/active", getActiveBridalCombos);

// CRUD routes
router.post("/", createBridalCombo);
router.get("/", getBridalCombos);
router.get("/:id", getBridalComboById);
router.put("/:id", updateBridalCombo);
router.delete("/:id", deleteBridalCombo);

// Item management routes
router.post("/:id/items", addItemToBridalCombo);
router.delete("/:id/items/:itemIndex", removeItemFromBridalCombo);

// Status management
router.patch("/:id/toggle-status", toggleComboStatus);

export default router;