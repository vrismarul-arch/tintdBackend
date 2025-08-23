import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    originalPrice: { type: Number, required: true },
    price: { type: Number, required: true },   // Final price after discount
    discount: { type: Number, default: 0 },    // Discount %
    duration: { type: Number, required: true }, // in minutes

    // Relations
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
    variety: { type: mongoose.Schema.Types.ObjectId, ref: "Variety", required: true },

    // ✅ Reference to ServiceDetail
    details: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceDetail" },

    imageUrl: String,

    // ✅ Step 1: Overview Section
    overview: [
      {
        img: { type: String, trim: true }, // store image URL
        title: { type: String, required: true, trim: true },
      },
    ],

    // ✅ Step 2: Procedure Steps Section
    procedureSteps: [
      {
        img: { type: String, trim: true }, // store image URL
        title: { type: String, required: true, trim: true },
        desc: { type: String, required: true, trim: true },
      },
    ],

    // ✅ Step 3: Things to Know Section
    thingsToKnow: [
      {
        title: { type: String, required: true, trim: true },
        desc: { type: String, required: true, trim: true },
      },
    ],

    // ✅ Step 4: Precautions / Aftercare Section
    precautionsAftercare: [
      {
        title: { type: String, required: true, trim: true },
        desc: { type: String, required: true, trim: true },
      },
    ],

    // ✅ Step 5: FAQs Section
    faqs: [
      {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

// Virtual field for auto-calculating % discount
serviceSchema.virtual("calculatedDiscount").get(function () {
  if (!this.originalPrice || !this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// ✅ Pre-save hook: auto-calculate price or discount
serviceSchema.pre("save", function (next) {
  // If discount is set, recalc price
  if (this.isModified("discount") && this.discount > 0) {
    this.price = this.originalPrice - (this.originalPrice * this.discount) / 100;
  }

  // If price is set manually, recalc discount
  if (this.isModified("price")) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  next();
});

serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Service", serviceSchema);
