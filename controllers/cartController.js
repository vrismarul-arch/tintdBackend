import Cart from "../models/Cart.js";
import Service from "../models/Service.js";

// Add service to cart
export const addToCart = async (req, res) => {
  const { serviceId, quantity } = req.body;
  const userId = req.user._id;

  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ error: "Service not found" });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const existing = cart.items.find((i) => i.service.toString() === serviceId);
  if (existing) existing.quantity += quantity || 1;
  else cart.items.push({ service: serviceId, quantity: quantity || 1 });

  await cart.save();
  await cart.populate("items.service");
  res.json(cart);
};

// Get cart
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.service");
  res.json(cart || { items: [] });
};
