// models/BridalCombo.js
import mongoose from 'mongoose';

const bridalComboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Combo name is required'],
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  customComboPrice: {
    type: Number,
    default: null
  },
  includesBridalMakeup: {
    type: Boolean,
    default: false
  },
  includesBridalMehendi: {
    type: Boolean,
    default: false
  },
  includesBridalSareeDraping: {
    type: Boolean,
    default: false
  },
  items: [{
    itemType: {
      type: String,
      enum: ['event', 'makeup', 'addon'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'items.modelName'
    },
    modelName: {
      type: String,
      enum: ['Event', 'Makeup', 'Addon']
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Remove any pre-save middleware to avoid issues
// No middleware here - modelName is set in the controller

const BridalCombo = mongoose.models.BridalCombo || mongoose.model('BridalCombo', bridalComboSchema);

export default BridalCombo;