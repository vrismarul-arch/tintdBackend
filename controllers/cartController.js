import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Service from "../models/Service.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { serviceId, quantity } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.service.toString() === serviceId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ service: serviceId, quantity });
  }

  await cart.save();
  await cart.populate("items.service");

  res.json({ items: cart.items });
});

// @desc Get cart
// @route GET /api/cart
// @access Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.service"
  );
  if (!cart) {
    return res.json({ items: [] });
  }
  res.json({ items: cart.items });
});

// @desc Remove item from cart
// @route DELETE /api/cart/:serviceId
// @access Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    (item) => item.service.toString() !== serviceId
  );
  await cart.save();
  await cart.populate("items.service");

  res.json({ items: cart.items });
});

// @desc Update quantity
// @route PUT /api/cart/:serviceId
// @access Private
export const updateQuantity = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0)
    return res.status(400).json({ message: "Quantity must be > 0" });

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(
    (i) => i.service.toString() === serviceId
  );
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.service");

  res.json({ items: cart.items });
});


export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id }); // remove all items for the logged-in user
    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ success: false, error: "Failed to clear cart" });
  }
};
