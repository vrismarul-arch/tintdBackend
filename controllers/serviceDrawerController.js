// controllers/serviceDrawerController.js
import ServiceDrawer from "../models/servicedrawer.js";

// ✅ Create new service drawer
export const createServiceDrawer = async (req, res) => {
  try {
    const newDrawer = new ServiceDrawer(req.body);
    await newDrawer.save();
    res.status(201).json({ success: true, data: newDrawer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Get all service drawers
export const getAllServiceDrawers = async (req, res) => {
  try {
    const drawers = await ServiceDrawer.find();
    res.status(200).json({ success: true, data: drawers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get a single service drawer by ID
export const getServiceDrawerById = async (req, res) => {
  try {
    const drawer = await ServiceDrawer.findById(req.params.id);
    if (!drawer) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, data: drawer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update service drawer by ID
export const updateServiceDrawer = async (req, res) => {
  try {
    const updatedDrawer = await ServiceDrawer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDrawer) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.status(200).json({ success: true, data: updatedDrawer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete service drawer by ID
export const deleteServiceDrawer = async (req, res) => {
  try {
    const deleted = await ServiceDrawer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
