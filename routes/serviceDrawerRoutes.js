import express from "express";
import {
  createServiceDrawer,
  getAllServiceDrawers,
  getServiceDrawerById,
  updateServiceDrawer,
  deleteServiceDrawer,
} from "../controllers/serviceDrawerController.js";

const router = express.Router();

// CRUD
router.post("/", createServiceDrawer);
router.get("/", getAllServiceDrawers);
router.get("/:id", getServiceDrawerById);
router.put("/:id", updateServiceDrawer);
router.delete("/:id", deleteServiceDrawer);

export default router;
