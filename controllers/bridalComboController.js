// controllers/bridalComboController.js
import BridalCombo from "../models/BridalCombo.js";
import Event from "../models/Event.js";
import Makeup from "../models/Makeup.js";
import Addon from "../models/Addon.js";

// Helper function to get item price
const getItemPrice = (itemType, itemData) => {
  if (!itemData) return 0;
  
  try {
    switch (itemType) {
      case 'event':
      case 'Event':
        const min = itemData.priceRange?.min || 0;
        const max = itemData.priceRange?.max || 0;
        return (min + max) / 2;
      
      case 'makeup':
      case 'Makeup':
        return itemData.startingPrice || 0;
      
      case 'addon':
      case 'Addon':
        if (itemData.discountPrice && itemData.discountPrice > 0) {
          return itemData.discountPrice;
        }
        return itemData.price || 0;
      
      default:
        return 0;
    }
  } catch (error) {
    console.error("Error getting item price:", error);
    return 0;
  }
};

// Helper to get correct model name
const getModelName = (itemType) => {
  const type = String(itemType).toLowerCase();
  if (type === 'event') return 'Event';
  if (type === 'makeup') return 'Makeup';
  if (type === 'addon') return 'Addon';
  return 'Addon';
};

// @desc    Get all bridal combos
export const getBridalCombos = async (req, res) => {
  try {
    const bridalCombos = await BridalCombo.find()
      .populate('items.itemId')
      .sort({ createdAt: -1 });
    
    const transformedCombos = bridalCombos.map(combo => {
      const comboObj = combo.toObject();
      let totalOriginal = 0;
      
      comboObj.items = comboObj.items.map(item => {
        let price = 0;
        if (item.itemId) {
          price = getItemPrice(item.itemType, item.itemId);
        }
        totalOriginal += price * item.quantity;
        
        return {
          ...item,
          calculatedPrice: price,
          subtotal: price * item.quantity
        };
      });
      
      let finalPrice = totalOriginal;
      if (combo.customComboPrice && combo.customComboPrice > 0) {
        finalPrice = combo.customComboPrice;
      } else if (combo.discountPercentage && combo.discountPercentage > 0) {
        finalPrice = totalOriginal * (1 - combo.discountPercentage / 100);
      }
      
      comboObj.calculatedTotalOriginal = totalOriginal;
      comboObj.calculatedFinalPrice = finalPrice;
      comboObj.calculatedSavings = totalOriginal - finalPrice;
      
      return comboObj;
    });
    
    res.status(200).json({ success: true, data: transformedCombos });
  } catch (error) {
    console.error("Get combos error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create bridal combo
export const createBridalCombo = async (req, res) => {
  try {
    const {
      name,
      description,
      discountPercentage,
      customComboPrice,
      includesBridalMakeup,
      includesBridalMehendi,
      includesBridalSareeDraping,
      items,
      isActive
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Combo name is required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required in the combo'
      });
    }

    // Add modelName to each item
    const enrichedItems = items.map(item => {
      let modelName = 'Addon';
      if (item.itemType === 'event') modelName = 'Event';
      if (item.itemType === 'makeup') modelName = 'Makeup';
      if (item.itemType === 'addon') modelName = 'Addon';
      
      return {
        itemType: item.itemType,
        itemId: item.itemId,
        quantity: item.quantity || 1,
        modelName: modelName
      };
    });

    const newCombo = new BridalCombo({
      name,
      description,
      discountPercentage: discountPercentage || 0,
      customComboPrice: customComboPrice || null,
      includesBridalMakeup: includesBridalMakeup || false,
      includesBridalMehendi: includesBridalMehendi || false,
      includesBridalSareeDraping: includesBridalSareeDraping || false,
      items: enrichedItems,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedCombo = await newCombo.save();

    return res.status(201).json({
      success: true,
      message: 'Bridal combo created successfully',
      data: savedCombo
    });
  } catch (error) {
    console.error('Create combo error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create bridal combo'
    });
  }
};

// @desc    Get single bridal combo
export const getBridalComboById = async (req, res) => {
  try {
    const bridalCombo = await BridalCombo.findById(req.params.id)
      .populate('items.itemId');
    
    if (!bridalCombo) {
      return res.status(404).json({ success: false, error: "Bridal combo not found" });
    }
    
    const comboObj = bridalCombo.toObject();
    let totalOriginal = 0;
    
    comboObj.items = comboObj.items.map(item => {
      let price = 0;
      if (item.itemId) {
        price = getItemPrice(item.itemType, item.itemId);
      }
      totalOriginal += price * item.quantity;
      
      return {
        ...item,
        calculatedPrice: price,
        subtotal: price * item.quantity
      };
    });
    
    let finalPrice = totalOriginal;
    if (bridalCombo.customComboPrice && bridalCombo.customComboPrice > 0) {
      finalPrice = bridalCombo.customComboPrice;
    } else if (bridalCombo.discountPercentage && bridalCombo.discountPercentage > 0) {
      finalPrice = totalOriginal * (1 - bridalCombo.discountPercentage / 100);
    }
    
    comboObj.pricing = {
      subtotal: totalOriginal,
      discountAmount: totalOriginal - finalPrice,
      discountPercentage: bridalCombo.discountPercentage || 0,
      finalPrice: finalPrice,
      savings: totalOriginal - finalPrice
    };
    
    res.status(200).json({ success: true, data: comboObj });
  } catch (error) {
    console.error("Get combo by id error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update bridal combo
export const updateBridalCombo = async (req, res) => {
  try {
    const { items, ...rest } = req.body;
    
    let updatedData = { ...rest };
    
    if (items && items.length > 0) {
      const enrichedItems = items.map(item => {
        let modelName = 'Addon';
        if (item.itemType === 'event') modelName = 'Event';
        if (item.itemType === 'makeup') modelName = 'Makeup';
        if (item.itemType === 'addon') modelName = 'Addon';
        
        return {
          itemType: item.itemType,
          itemId: item.itemId,
          quantity: item.quantity || 1,
          modelName: modelName
        };
      });
      
      updatedData.items = enrichedItems;
    }
    
    const bridalCombo = await BridalCombo.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).populate('items.itemId');
    
    if (!bridalCombo) {
      return res.status(404).json({ success: false, error: "Bridal combo not found" });
    }
    
    res.status(200).json({ success: true, data: bridalCombo });
  } catch (error) {
    console.error("Update combo error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete bridal combo
export const deleteBridalCombo = async (req, res) => {
  try {
    const bridalCombo = await BridalCombo.findByIdAndDelete(req.params.id);
    
    if (!bridalCombo) {
      return res.status(404).json({ success: false, error: "Bridal combo not found" });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("Delete combo error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add item to bridal combo
export const addItemToBridalCombo = async (req, res) => {
  try {
    const { itemType, itemId, quantity } = req.body;
    const bridalCombo = await BridalCombo.findById(req.params.id);
    
    if (!bridalCombo) {
      return res.status(404).json({ success: false, error: "Bridal combo not found" });
    }
    
    let modelName = 'Addon';
    if (itemType === 'event') modelName = 'Event';
    if (itemType === 'makeup') modelName = 'Makeup';
    if (itemType === 'addon') modelName = 'Addon';
    
    bridalCombo.items.push({ 
      itemType: itemType,
      itemId, 
      quantity: quantity || 1,
      modelName: modelName
    });
    
    await bridalCombo.save();
    await bridalCombo.populate('items.itemId');
    
    res.status(200).json({ success: true, data: bridalCombo });
  } catch (error) {
    console.error("Add item error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Remove item from bridal combo
export const removeItemFromBridalCombo = async (req, res) => {
  try {
    const bridalCombo = await BridalCombo.findById(req.params.id);
    
    if (!bridalCombo) {
      return res.status(404).json({ success: false, error: "Bridal combo not found" });
    }
    
    const itemIndex = parseInt(req.params.itemIndex);
    if (itemIndex >= 0 && itemIndex < bridalCombo.items.length) {
      bridalCombo.items.splice(itemIndex, 1);
      await bridalCombo.save();
    }
    
    res.status(200).json({ success: true, data: bridalCombo });
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get active bridal combos
export const getActiveBridalCombos = async (req, res) => {
  try {
    const bridalCombos = await BridalCombo.find({ isActive: true })
      .populate('items.itemId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: bridalCombos });
  } catch (error) {
    console.error("Get active combos error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle combo status
export const toggleComboStatus = async (req, res) => {
  try {
    const bridalCombo = await BridalCombo.findById(req.params.id);
    
    if (!bridalCombo) {
      return res.status(404).json({ success: false, error: "Bridal combo not found" });
    }
    
    bridalCombo.isActive = !bridalCombo.isActive;
    await bridalCombo.save();
    
    res.status(200).json({ success: true, data: bridalCombo });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Search combos
export const searchBridalCombos = async (req, res) => {
  try {
    const { q } = req.query;
    
    const bridalCombos = await BridalCombo.find({
      name: { $regex: q, $options: 'i' }
    }).populate('items.itemId');
    
    res.status(200).json({ success: true, data: bridalCombos });
  } catch (error) {
    console.error("Search combos error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get combo stats
export const getComboStats = async (req, res) => {
  try {
    const total = await BridalCombo.countDocuments();
    const active = await BridalCombo.countDocuments({ isActive: true });
    
    res.status(200).json({ 
      success: true, 
      data: { 
        total, 
        active, 
        inactive: total - active 
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};