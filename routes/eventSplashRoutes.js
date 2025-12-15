import express from "express";
import {
  createEventSplash,
  getActiveEventSplash,
  getAllEventSplashes,
  updateEventSplash,
  deleteEventSplash,
  upload,
} from "../controllers/eventSplashController.js";

const router = express.Router();

// APP
router.get("/app-event-splash", getActiveEventSplash);

// ADMIN
router.get("/event-splash", getAllEventSplashes);
router.post("/event-splash", upload.single("image"), createEventSplash);
router.put("/event-splash/:id", upload.single("image"), updateEventSplash);
router.delete("/event-splash/:id", deleteEventSplash);

export default router;
