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

// Models for Socket.IO
import Cart from "./models/Cart.js";
import Service from "./models/Service.js";

dotenv.config();

// =============================
// 🔌 Connect MongoDB
// =============================
connectDB();

const app = express();

// =============================
// 🌐 CORS Configuration
// =============================
const allowedOrigins = [
  "http://localhost:5173", 
  "https://tintd.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / curl
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

// =============================
// 📦 Middleware
// =============================
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// =============================
// 🚏 API Routes
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/service-drawers", serviceDrawerRoutes);
app.use("/api/admin/subcategories", subCategoryRoutes);
app.use("/api/admin/varieties", varietyRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/payment", paymentRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("Salon Booking API is running ✅");
});

// =============================
// 🔊 Socket.IO (Cart Updates)
// =============================
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Emit cart to a user
const emitCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.service");
  io.to(userId.toString()).emit("cartUpdated", cart || { user: userId, items: [] });
};

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Join user cart room
  socket.on("joinCart", ({ userId }) => {
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`👤 ${socket.id} joined room for user: ${userId}`);
  });

  // Get cart
  socket.on("getCart", async ({ userId }) => {
    if (!userId) return;
    try {
      await emitCart(userId);
    } catch (err) {
      io.to(userId.toString()).emit("cartError", "Unable to load cart");
    }
  });

  // Add item to cart
  socket.on("addToCart", async ({ userId, serviceId, quantity = 1 }) => {
    try {
      if (!userId || !serviceId) return;
      const service = await Service.findById(serviceId);
      if (!service) return io.to(userId.toString()).emit("cartError", "Service not found");

      let cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });

      const existing = cart.items.find((i) => i.service.toString() === serviceId);
      if (existing) existing.quantity += Number(quantity) || 1;
      else cart.items.push({ service: serviceId, quantity: Number(quantity) || 1 });

      await cart.save();
      await emitCart(userId);
    } catch (err) {
      io.to(userId.toString()).emit("cartError", "Unable to add to cart");
    }
  });

  // Update item quantity
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
      io.to(userId.toString()).emit("cartError", "Unable to update quantity");
    }
  });

  // Remove item from cart
  socket.on("removeFromCart", async ({ userId, serviceId }) => {
    try {
      if (!userId || !serviceId) return;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) return;

      cart.items = cart.items.filter((i) => i.service.toString() !== serviceId);
      await cart.save();
      await emitCart(userId);
    } catch (err) {
      io.to(userId.toString()).emit("cartError", "Unable to remove item");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// =============================
// 🚀 Start Server
// =============================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
