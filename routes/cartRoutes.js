import express from "express";
import { addToCart, getCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/cart/add", protect, addToCart);
router.get("/cart", protect, getCart);

export default router;
