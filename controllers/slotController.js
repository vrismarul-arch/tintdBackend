import Slot from "../models/Slot.js";

// Create Slot
export const createSlot = async (req, res) => {
  try {
    const slot = new Slot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Slots
export const getSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ isActive: true }).sort({ start: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Slot
export const updateSlot = async (req, res) => {
  try {
    const updated = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Slot not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Slot
export const deleteSlot = async (req, res) => {
  try {
    const deleted = await Slot.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Slot not found" });
    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
