// models/QuoteRequest.js (NEW - for quotation requests)
import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema({
  customerDetails: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    weddingDate: {
      type: Date,
      required: false
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    }
  },
  selectedCombo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BridalCombo'
    },
    name: String,
    price: Number,
    items: [{
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number
    }]
  },
  selectedAddons: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Addon'
    },
    title: String,
    price: Number
  }],
  estimatedTotal: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted', 'expired'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const QuoteRequest = mongoose.models.QuoteRequest || mongoose.model('QuoteRequest', quoteRequestSchema);
export default QuoteRequest;