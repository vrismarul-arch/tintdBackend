// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

// HTTP routes (your existing ones)
import adminRoutes from "./routes/adminRoutes.js";
import serviceDrawerRoutes from "./routes/serviceDrawerRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import varietyRoutes from "./routes/varietyRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

// 👉 If you keep REST cart endpoints, leave the next 2 lines;
//    if you’re using Socket-only for cart, you can remove them.
import cartRoutes from "./routes/cartRoutes.js";

// Models needed by Socket.IO handlers
import Cart from "./models/Cart.js";
import Service from "./models/Service.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

// =============================
// 🔌 Connect Mongo
// =============================
connectDB();

const app = express();

// =============================
// 🌐 CORS (Allow-list only)
// =============================
const allowedOrigins = [
  "http://localhost:5173",      // local dev
  "https://tintd.netlify.app",  // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools (Postman/curl) with no origin
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        const msg = `🚫 CORS blocked: Origin not allowed -> ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// =============================
// 🚏 HTTP Routes
// =============================
app.use("/api", authRoutes);
app.use("/api/profile", profileRoutes);

// 👉 Keep or remove depending on whether you want REST cart as well.
app.use("/api", cartRoutes);
app.use("/api/bookings", bookingRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/service-drawers", serviceDrawerRoutes);
app.use("/api/admin/subcategories", subCategoryRoutes);
app.use("/api/admin/varieties", varietyRoutes);
app.use("/api/admin/banners", bannerRoutes);

// Health check
app.get("/", (_req, res) => {
  res.send("Salon Booking API is running ✅");
});

// =============================
// 🔊 Socket.IO
// =============================
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Helper: safely emit only to a user
const emitCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.service");
  io.to(userId.toString()).emit("cartUpdated", cart || { user: userId, items: [] });
};

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Client should call with { userId } right after login/app mount
  socket.on("joinCart", ({ userId }) => {
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`👤 ${socket.id} joined room for user: ${userId}`);
  });

  // Initial load
  socket.on("getCart", async ({ userId }) => {
    try {
      if (!userId) return;
      await emitCart(userId);
    } catch (err) {
      console.error("❌ getCart error:", err.message);
      io.to(userId.toString()).emit("cartError", "Unable to load cart");
    }
  });

  // Add item
  socket.on("addToCart", async ({ userId, serviceId, quantity = 1 }) => {
    try {
      if (!userId || !serviceId) return;

      const service = await Service.findById(serviceId);
      if (!service) {
        return io.to(userId.toString()).emit("cartError", "Service not found");
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });

      const existing = cart.items.find((i) => i.service.toString() === serviceId);
      if (existing) {
        existing.quantity += Number(quantity) || 1;
      } else {
        cart.items.push({ service: serviceId, quantity: Number(quantity) || 1 });
      }

      await cart.save();
      await emitCart(userId);
    } catch (err) {
      console.error("❌ addToCart error:", err.message);
      io.to(userId.toString()).emit("cartError", "Unable to add to cart");
    }
  });

  // Update quantity
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
    } catch (err) {
      console.error("❌ updateQuantity error:", err.message);
      io.to(userId.toString()).emit("cartError", "Unable to update quantity");
    }
  });

  // Remove item
  socket.on("removeFromCart", async ({ userId, serviceId }) => {
    try {
      if (!userId || !serviceId) return;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) return;

      cart.items = cart.items.filter((i) => i.service.toString() !== serviceId);
      await cart.save();

      await emitCart(userId);
    } catch (err) {
      console.error("❌ removeFromCart error:", err.message);
      io.to(userId.toString()).emit("cartError", "Unable to remove item");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// =============================
// 🚀 Start server
// =============================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
