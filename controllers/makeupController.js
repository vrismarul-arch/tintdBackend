import Makeup from "../models/Makeup.js";

// ➕ Create Makeup
export const createMakeup = async (req, res) => {
  try {
    const makeup = await Makeup.create(req.body);
    res.status(201).json(makeup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get Makeups
export const getMakeups = async (req, res) => {
  try {
    const makeups = await Makeup.find();
    res.json(makeups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Makeup
export const updateMakeup = async (req, res) => {
  try {
    const updated = await Makeup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑 Delete Makeup
export const deleteMakeup = async (req, res) => {
  try {
    await Makeup.findByIdAndDelete(req.params.id);
    res.json({ message: "Makeup deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};