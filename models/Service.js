import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    originalPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    duration: { type: Number, required: true },

    // ⭐ STATUS
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    // relations
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
    variety: { type: mongoose.Schema.Types.ObjectId, ref: "Variety", required: true },

    details: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceDetail" },

    imageUrl: String,

    overview: [
      {
        img: { type: String, trim: true },
        title: { type: String, required: true }
      }
    ],

    procedureSteps: [
      {
        img: { type: String, trim: true },
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],

    thingsToKnow: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],

    precautionsAftercare: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true }
      }
    ],

    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

// virtual discount calculation
serviceSchema.virtual("calculatedDiscount").get(function () {
  if (!this.originalPrice || !this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// auto adjust discount/price
serviceSchema.pre("save", function (next) {
  if (this.isModified("discount") && this.discount > 0) {
    this.price = this.originalPrice - (this.originalPrice * this.discount) / 100;
  }
  if (this.isModified("price")) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Service", serviceSchema);
