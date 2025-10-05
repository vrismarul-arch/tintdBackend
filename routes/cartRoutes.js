// routes/cartRoutes.js
import express from "express";
import { 
  addToCart, 
  getCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart  
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Corrected paths (no extra /cart prefix)
router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.put("/:serviceId", protect, updateQuantity);
router.delete("/:serviceId", protect, removeFromCart);
router.delete("/", protect, clearCart);

export default router;
