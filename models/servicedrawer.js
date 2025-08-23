import mongoose from "mongoose";

const serviceDrawerSchema = new mongoose.Schema(
{
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

export default mongoose.model("ServiceDrawer", serviceDrawerSchema);
