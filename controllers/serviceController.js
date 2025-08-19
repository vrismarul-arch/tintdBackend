// controllers/serviceController.js
import Service from "../models/Service.js";
import supabase from "../config/supabase.js";
import multer from "multer";

// Setup multer memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Utility: calculate discount %
const calculateDiscount = (originalPrice, price) => {
  if (!originalPrice || !price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

// Upload image to Supabase
const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage
    .from("tintd")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw error;

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/tintd/${fileName}`;
};

// ✅ CREATE
export const createService = async (req, res) => {
  try {
    let data = req.body;

    // Parse nested arrays (they come as JSON string from FormData)
    ["Overview", "procedureSteps", "thingsToKnow", "precautionsAftercare", "faqs"].forEach(
      (field) => {
        if (data[field]) {
          try {
            data[field] = JSON.parse(data[field]);
          } catch {
            data[field] = [];
          }
        }
      }
    );

    // Upload main image
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    // Handle discount calculation
    if (data.originalPrice && data.price) {
      data.discount = calculateDiscount(data.originalPrice, data.price);
    }

    const service = new Service({
      ...data,
      imageUrl,
    });

    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ UPDATE
export const updateService = async (req, res) => {
  try {
    let data = req.body;

    // Parse JSON arrays
    ["Overview", "procedureSteps", "thingsToKnow", "precautionsAftercare", "faqs"].forEach(
      (field) => {
        if (data[field]) {
          try {
            data[field] = JSON.parse(data[field]);
          } catch {
            // already array or invalid JSON, ignore
          }
        }
      }
    );

    // Upload new image if provided
    if (req.file) {
      data.imageUrl = await uploadToSupabase(req.file);
    }

    // Auto-calc discount
    if (data.originalPrice) {
      if (data.price) {
        data.discount = calculateDiscount(data.originalPrice, data.price);
      }
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Service not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ READ
// ✅ READ
export const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const services = await Service.find(query)
      .populate("category", "name description imageUrl")     // Category details
      .populate("subCategory", "name description imageUrl")  // SubCategory details
      .populate("variety", "name description imageUrl");     // Variety details

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE
export const deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Service not found" });

    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
