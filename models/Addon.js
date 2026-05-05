// models/Addon.js
import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  discountPrice: Number,
  duration: {
    type: Number,
    default: 60
  },
  category: {
    type: String,
    enum: ['hair', 'makeup', 'mehendi', 'draping', 'skincare', 'other'],
    default: 'other'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ Check if model already exists before creating
const Addon = mongoose.models.Addon || mongoose.model('Addon', addonSchema);

export default Addon;