import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// DB connection
import connectDB from "./config/db.js";

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
import partnerNotificationRoutes from "./routes/partners/partnerRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

// Models
import Cart from "./models/Cart.js";
import Service from "./models/Service.js";
import Booking from "./models/Booking.js";
import Partner from "./models/partners/Partner.js";

dotenv.config();
connectDB();

const app = express();

// =============================
// 🌐 CORS Configuration
// =============================
const allowedOrigins = ["http://localhost:5173", "https://tintd.netlify.app"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin))
        return callback(new Error(`🚫 CORS blocked: ${origin}`), false);
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// =============================
// 🚏 API Routes
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);
/* dsfd */
// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/service-drawers", serviceDrawerRoutes);
app.use("/api/admin/subcategories", subCategoryRoutes);
app.use("/api/admin/varieties", varietyRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/partners", adminPartnerRoutes); // ✅ only once
app.use("/api/payment", paymentRoutes);
app.use("/api/services", serviceRoutes);

// Partner routes
app.use("/api/partners", partnerRoutes);
app.use("/api/partners", partnerOnboardingRoutes);
app.use("/api/admin/partners", adminPartnerRoutes);
app.use("/api/partners/onboarding", partnerOnboardingRoutes);
app.use("/api/partners/bookings", partnerBookingRoutes);
app.use("/api/partners/notifications", partnerNotificationRoutes);

// Health check
app.get("/", (_req, res) => res.send("Salon Booking API is running ✅"));

// =============================
// 🔊 Socket.IO Setup
// =============================
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});

// Emit helper
const emitUpdate = (room, event, data) => io.to(room).emit(event, data);

// =============================
// 🔄 Socket.IO Connections
// =============================
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Join room
  socket.on("joinRoom", ({ room }) => {
    if (!room) return;
    socket.join(room);
    console.log(`👤 ${socket.id} joined room: ${room}`);
  });

  // CART EVENTS
  const emitCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate("items.service");
    emitUpdate(`user:${userId}`, "cartUpdated", cart || { user: userId, items: [] });
  };

  socket.on("getCart", async ({ userId }) => userId && emitCart(userId));
  socket.on("addToCart", async ({ userId, serviceId, quantity = 1 }) => {
    try {
      if (!userId || !serviceId) return;
      const service = await Service.findById(serviceId);
      if (!service) return emitUpdate(`user:${userId}`, "cartError", "Service not found");

      let cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });

      const existing = cart.items.find((i) => i.service.toString() === serviceId);
      if (existing) existing.quantity += Number(quantity) || 1;
      else cart.items.push({ service: serviceId, quantity: Number(quantity) || 1 });

      await cart.save();
      await emitCart(userId);
    } catch {
      emitUpdate(`user:${userId}`, "cartError", "Unable to add to cart");
    }
  });

  socket.on("updateQuantity", async ({ userId, serviceId, quantity }) => {
    try {
      if (!userId || !serviceId) return;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) return;

      const item = cart.items.find((i) => i.service.toString() === serviceId);
      if (item) {
        const q = parseInt(quantity, 10);
        item.quantity = Number.isNaN(q) || q < 1 ? 1 : q;
        await cart.save();
      }
      await emitCart(userId);
    } catch {
      emitUpdate(`user:${userId}`, "cartError", "Unable to update quantity");
    }
  });

  socket.on("removeFromCart", async ({ userId, serviceId }) => {
    try {
      if (!userId || !serviceId) return;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) return;

      cart.items = cart.items.filter((i) => i.service.toString() !== serviceId);
      await cart.save();
      await emitCart(userId);
    } catch {
      emitUpdate(`user:${userId}`, "cartError", "Unable to remove item");
    }
  });

  // BOOKING EVENTS
  socket.on("newBooking", async ({ bookingId }) => {
    const booking = await Booking.findById(bookingId).populate("user services.serviceId");
    if (!booking) return;

    emitUpdate(`user:${booking.user._id}`, "bookingConfirmed", booking);

    const notification = {
      id: booking._id,
      bookingId: booking._id,
      booking,
      text: `New booking ${booking.bookingId || booking._id} is available`,
      createdAt: booking.createdAt,
    };
    io.to("partners").emit("newNotification", notification);
    emitUpdate("admin", "newBooking", booking);
  });

  socket.on("assignBooking", async ({ bookingId, partnerId }) => {
    const booking = await Booking.findById(bookingId).populate("services.serviceId");
    if (!booking) return;

    emitUpdate(`partner:${partnerId}`, "assignedBooking", booking);
  });

  // PARTNER EVENTS
  socket.on("partnerApproved", async ({ partnerId }) => {
    const partner = await Partner.findById(partnerId);
    if (!partner) return;

    emitUpdate(`partner:${partnerId}`, "partnerApproved", partner);
    emitUpdate("admin", "partnerApproved", partner);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// =============================
// 🚀 Start Server
// =============================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
