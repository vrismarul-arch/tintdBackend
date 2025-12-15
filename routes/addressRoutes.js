import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addAddress,
  getAddresses,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.post("/add", protect, addAddress);
router.get("/", protect, getAddresses);
router.put("/:id/default", protect, setDefaultAddress);
router.delete("/:id", protect, deleteAddress);

export default router;
