import EventSplash from "../models/EventSplash.js";
import multer from "multer";
import { uploadToSupabase } from "../utils/supabaseUpload.js";

/* ======================
   MULTER
====================== */
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/* ======================
   CREATE EVENT
====================== */
export const createEventSplash = async (req, res) => {
  try {
    const { title, subtitle, active } = req.body;

    if (!title) return res.status(400).json({ error: "Title required" });
    if (!req.file) return res.status(400).json({ error: "Image required" });

    let schedule = null;
    if (req.body.schedule) {
      const s = JSON.parse(req.body.schedule);
      schedule = {
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
      };
    }

    const image = await uploadToSupabase(req.file);

    // 🔥 only one active event
    if (active === "true" || active === true) {
      await EventSplash.updateMany({}, { active: false });
    }

    const event = await EventSplash.create({
      title,
      subtitle,
      image,
      active: active === "true" || active === true,
      schedule,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ======================
   GET ACTIVE EVENT (APP)
====================== */
export const getActiveEventSplash = async (req, res) => {
  try {
    const now = new Date();

    const event = await EventSplash.findOne({
      active: true,
      $or: [
        { schedule: { $exists: false } },
        { schedule: null },
        {
          "schedule.startDate": { $lte: now },
          "schedule.endDate": { $gte: now },
        },
      ],
    }).sort({ createdAt: -1 });

    if (!event) {
      return res.json({ active: false });
    }

    res.json({
      active: true,
      title: event.title,
      subtitle: event.subtitle,
      image: event.image,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================
   GET ALL (ADMIN)
====================== */
export const getAllEventSplashes = async (req, res) => {
  try {
    const events = await EventSplash.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================
   UPDATE EVENT
====================== */
export const updateEventSplash = async (req, res) => {
  try {
    const data = req.body;

    if (data.schedule) {
      const s = JSON.parse(data.schedule);
      data.schedule = {
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
      };
    }

    if (req.file) {
      data.image = await uploadToSupabase(req.file);
    }

    if (data.active === "true" || data.active === true) {
      await EventSplash.updateMany(
        { _id: { $ne: req.params.id } },
        { active: false }
      );
    }

    const updated = await EventSplash.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ======================
   DELETE EVENT
====================== */
export const deleteEventSplash = async (req, res) => {
  try {
    const deleted = await EventSplash.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
