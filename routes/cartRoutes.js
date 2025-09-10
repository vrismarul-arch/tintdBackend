// routes/cartRoutes.js
import express from "express";
import { 
  addToCart, 
  getCart, 
  updateQuantity, 
  removeFromCart 
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add item to cart
router.post("/cart/add", protect, addToCart);

// Get user cart
router.get("/cart", protect, getCart);

// Update quantity
router.put("/cart/:serviceId", protect, updateQuantity);

// Remove item
router.delete("/cart/:serviceId", protect, removeFromCart);

export default router;
