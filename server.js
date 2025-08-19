import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceDrawerRoutes from "./routes/serviceDrawerRoutes.js";  // ✅ add this
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import varietyRoutes from "./routes/varietyRoutes.js";
dotenv.config();

// ✅ Connect MongoDB
connectDB();

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" })); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/service-drawers", serviceDrawerRoutes); // ✅ now works
app.use("/api/admin/subcategories", subCategoryRoutes);
app.use("/api/admin/varieties", varietyRoutes);

// ✅ Socket.IO setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Salon Booking API is running ✅");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
