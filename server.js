import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// DB
import connectDB from "./config/db.js";

// ✅ IMPORT ALL MODELS FIRST (in correct order)
import "./models/Event.js";
import "./models/Makeup.js";
import "./models/Addon.js";
import "./models/BridalCombo.js";

// Models for socket.io
import Cart from "./models/Cart.js";
import Booking from "./models/Booking.js";
import Partner from "./models/partners/Partner.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceDrawerRoutes from "./routes/serviceDrawerRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import varietyRoutes from "./routes/varietyRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminBookingRoutes from "./routes/admin/adminBookingRoutes.js";
import adminPartnerRoutes from "./routes/partners/adminPartnerRoutes.js";
import partnerRoutes from "./routes/partners/partnerRoutes.js";
import partnerOnboardingRoutes from "./routes/partners/partnerOnboardingRoutes.js";
import partnerBookingRoutes from "./routes/partners/partnerBookingRoutes.js";
import partnerNotificationRoutes from "./routes/partners/notificationRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import comboRoutes from "./routes/comboRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import eventSplashRoutes from "./routes/eventSplashRoutes.js";

// ✅ BRIDAL BOOKING ROUTES (for customer bookings)
import bridalBookingRoutes from "./routes/BridalBookingRoutes.js";

// ✅ QUOTE REQUEST ROUTES
import quoteRoutes from "./routes/quoteRoutes.js";

// ✅ ADDON ROUTES
import addOnRoutes from "./routes/addonRoutes.js";
import eventRoutes from "./routes/EventRoutes.js";
import makeupRoutes from "./routes/makeupRoutes.js";
// ✅ BRIDAL COMBO ROUTES
import bridalComboRoutes from "./routes/bridalComboRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* =============================
   🌐 CORS
============================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =============================
   🧾 MIDDLEWARE
============================= */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

/* =============================
   🚏 ROUTES
============================= */
app.use("/api", eventSplashRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/service-drawers", serviceDrawerRoutes);
app.use("/api/admin/subcategories", subCategoryRoutes);
app.use("/api/admin/varieties", varietyRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/partners", adminPartnerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/combos", comboRoutes);

// Partner routes
app.use("/api/partners", partnerRoutes);
app.use("/api/partners/onboarding", partnerOnboardingRoutes);
app.use("/api/partners/bookings", partnerBookingRoutes);
app.use("/api/partners/notifications", partnerNotificationRoutes);

// Bridal
// ============================================
// 🎀 BRIDAL & MAKEUP ROUTES
// ============================================

// 1. Events
app.use("/api/events", eventRoutes);

// 2. Makeup services
app.use("/api/makeups", makeupRoutes);

// 3. Add-ons (Hair, Makeup, Mehendi, Draping, Skincare, etc.)
app.use("/api/addons", addOnRoutes);

// 4. Bridal Combos (Packages combining multiple services)
app.use("/api/bridal-combos", bridalComboRoutes);

// 5. Quote Requests (Customer inquiries before booking)
app.use("/api/quote-requests", quoteRoutes);

// 6. Bridal Bookings (Confirmed bookings from quotes or direct)
app.use("/api/bridal-bookings", bridalBookingRoutes);


// Health check
app.get("/", (_req, res) => {
  res.send("Salon Booking API running ✅");
});

/* =============================
   🔊 SOCKET.IO
============================= */
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Helper
const emitUpdate = (room, event, data) => {
  io.to(room).emit(event, data);
};

/* =============================
   🔄 SOCKET CONNECTION
============================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinRoom", ({ room }) => {
    if (room) socket.join(room);
  });

  /* =============================
     🛒 CART SOCKET
  ============================= */
  const emitCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate([
      { path: "items.service" },
      { path: "items.combo" },
    ]);

    emitUpdate(
      `user:${userId}`,
      "cartUpdated",
      cart || { user: userId, items: [] }
    );
  };

  socket.on("getCart", async ({ userId }) => {
    if (userId) await emitCart(userId);
  });

  socket.on("addToCart", async ({ userId, itemType, itemId, quantity = 1 }) => {
    try {
      if (!userId || !itemType || !itemId) return;

      let cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });

      const index = cart.items.findIndex((i) =>
        itemType === "service"
          ? i.itemType === "service" && i.service?.toString() === itemId
          : i.itemType === "combo" && i.combo?.toString() === itemId
      );

      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({
          itemType,
          service: itemType === "service" ? itemId : undefined,
          combo: itemType === "combo" ? itemId : undefined,
          quantity,
        });
      }

      await cart.save();
      await emitCart(userId);
    } catch (err) {
      console.error("Cart error:", err);
      emitUpdate(`user:${userId}`, "cartError", "Add to cart failed");
    }
  });

  socket.on("updateQuantity", async ({ userId, itemType, itemId, quantity }) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) return;

      const item = cart.items.find((i) =>
        itemType === "service"
          ? i.service?.toString() === itemId
          : i.combo?.toString() === itemId
      );

      if (item) {
        item.quantity = Math.max(1, quantity);
        await cart.save();
      }

      await emitCart(userId);
    } catch (err) {
      console.error("Quantity update error:", err);
      emitUpdate(`user:${userId}`, "cartError", "Quantity update failed");
    }
  });

  socket.on("removeFromCart", async ({ userId, itemType, itemId }) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) return;

      cart.items = cart.items.filter((i) =>
        itemType === "service"
          ? i.service?.toString() !== itemId
          : i.combo?.toString() !== itemId
      );

      await cart.save();
      await emitCart(userId);
    } catch (err) {
      console.error("Remove error:", err);
      emitUpdate(`user:${userId}`, "cartError", "Remove failed");
    }
  });

  /* =============================
     📦 BOOKINGS
  ============================= */
  socket.on("newBooking", async ({ bookingId }) => {
    const booking = await Booking.findById(bookingId).populate(
      "user services.serviceId"
    );
    if (!booking) return;

    emitUpdate(`user:${booking.user._id}`, "bookingConfirmed", booking);
    emitUpdate("admin", "newBooking", booking);
    io.to("partners").emit("newNotification", booking);
  });

  socket.on("assignBooking", async ({ bookingId, partnerId }) => {
    const booking = await Booking.findById(bookingId).populate(
      "services.serviceId"
    );
    if (booking)
      emitUpdate(`partner:${partnerId}`, "assignedBooking", booking);
  });

  socket.on("partnerApproved", async ({ partnerId }) => {
    const partner = await Partner.findById(partnerId);
    if (partner) {
      emitUpdate(`partner:${partnerId}`, "partnerApproved", partner);
      emitUpdate("admin", "partnerApproved", partner);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* =============================
   🚀 SERVER START
============================= */
const PORT = process.env.PORT || 5002;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});