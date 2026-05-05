// controllers/addonController.js
import Addon from '../models/AddOn.js';

// Get all addons
export const getAddons = async (req, res) => {
  try {
    const addons = await Addon.find();
    res.status(200).json({
      success: true,
      data: addons
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single addon
export const getAddonById = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);
    if (!addon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Addon not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: addon
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create addon
export const createAddon = async (req, res) => {
  try {
    const addon = await Addon.create(req.body);
    res.status(201).json({
      success: true,
      data: addon
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update addon
export const updateAddon = async (req, res) => {
  try {
    const addon = await Addon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!addon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Addon not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: addon
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete addon
export const deleteAddon = async (req, res) => {
  try {
    const addon = await Addon.findByIdAndDelete(req.params.id);
    if (!addon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Addon not found' 
      });
    }
    res.status(200).json({
      success: true,
      message: 'Addon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get addon stats
export const getAddonStats = async (req, res) => {
  try {
    const total = await Addon.countDocuments();
    const active = await Addon.countDocuments({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};