import express from "express";
import {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/:itemType/:itemId", protect, updateQuantity);
router.delete("/:itemType/:itemId", protect, removeFromCart);
router.delete("/", protect, clearCart);

export default router;
