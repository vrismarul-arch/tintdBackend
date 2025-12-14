import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Service from "../models/Service.js";
import ComboPackage from "../models/ComboPackage.js";
import Banner from "../models/banner.js";

/* ================= ADD TO CART ================= */
export const addToCart = asyncHandler(async (req, res) => {
  const { itemType, itemId, quantity = 1 } = req.body;

  if (!["service", "combo"].includes(itemType)) {
    res.status(400);
    throw new Error("Invalid item type");
  }

  // validate item
  let item;
  let comboImage = null;

  if (itemType === "service") {
    item = await Service.findById(itemId);
  } else {
    item = await ComboPackage.findById(itemId);

    // 🔥 GET COMBO IMAGE FROM BANNER
    const banner = await Banner.findOne({
      combo: itemId,
      isActive: true,
    }).select("imageUrl");

    comboImage = banner?.imageUrl || null;
  }

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const index = cart.items.findIndex(
    (i) =>
      i.itemType === itemType &&
      (itemType === "service"
        ? i.service?.toString() === itemId
        : i.combo?.toString() === itemId)
  );

  if (index > -1) {
    cart.items[index].quantity += quantity;
  } else {
    cart.items.push({
      itemType,
      service: itemType === "service" ? itemId : null,
      combo: itemType === "combo" ? itemId : null,
      comboImage, // ✅ IMPORTANT
      quantity,
    });
  }

  await cart.save();

  await cart.populate([
    { path: "items.service" },
    { path: "items.combo" },
  ]);

  res.json({ items: cart.items });
});

/* ================= GET CART ================= */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.service")
    .populate("items.combo");

  if (!cart) {
    return res.json({ items: [] });
  }

  // 🔥 Attach combo image from Banner
  const itemsWithImages = await Promise.all(
    cart.items.map(async (item) => {
      if (item.itemType === "combo" && item.combo) {
        const banner = await Banner.findOne({
          combo: item.combo._id,
          isActive: true,
        }).select("imageUrl");

        return {
          ...item.toObject(),
          comboImage: banner?.imageUrl || null,
        };
      }

      return item.toObject();
    })
  );

  res.json({ items: itemsWithImages });
});
/* ================= REMOVE ITEM ================= */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ items: [] });

  cart.items = cart.items.filter(
    (i) =>
      !(
        i.itemType === itemType &&
        (itemType === "service"
          ? i.service?.toString() === itemId
          : i.combo?.toString() === itemId)
      )
  );

  await cart.save();

  await cart.populate([
    { path: "items.service" },
    { path: "items.combo" },
  ]);

  res.json({ items: cart.items });
});

/* ================= UPDATE QTY ================= */
export const updateQuantity = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be > 0");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(
    (i) =>
      i.itemType === itemType &&
      (itemType === "service"
        ? i.service?.toString() === itemId
        : i.combo?.toString() === itemId)
  );

  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = quantity;
  await cart.save();

  await cart.populate([
    { path: "items.service" },
    { path: "items.combo" },
  ]);

  res.json({ items: cart.items });
});

/* ================= CLEAR CART ================= */
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.deleteMany({ user: req.user._id });
  res.json({ success: true, message: "Cart cleared successfully" });
});
