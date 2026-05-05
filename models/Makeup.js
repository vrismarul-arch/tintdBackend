import mongoose from 'mongoose';

const makeupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startingPrice: {
    type: Number,
    required: true
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Make sure the model name is 'Makeup' (capital M)
const Makeup = mongoose.model('Makeup', makeupSchema);
export default Makeup;