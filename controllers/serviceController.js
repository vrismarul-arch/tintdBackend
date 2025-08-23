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

// Upload file to Supabase
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

// 🔄 Helper: map uploaded files into JSON arrays
const processNestedImages = async (data, files, field, fileFieldName) => {
  if (!data[field]) return [];
  let arr;
  try {
    arr = JSON.parse(data[field]);
  } catch {
    arr = data[field];
  }
  if (!Array.isArray(arr)) return [];

  arr = await Promise.all(
    arr.map(async (item, idx) => {
      if (item.img && typeof item.img === "string" && item.img.startsWith("http")) {
        return item; // keep existing URL
      }

      // check if a file was uploaded for this index
      const uploaded = files.find((f) => f.fieldname === `${fileFieldName}_${idx}`);
      if (uploaded) {
        const url = await uploadToSupabase(uploaded);
        return { ...item, img: url };
      }

      return item;
    })
  );

  return arr;
};


// ✅ CREATE
export const createService = async (req, res) => {
  try {
    let data = req.body;

    data.overview = await processNestedImages(data, req.files, "overview", "overviewImages");
    data.procedureSteps = await processNestedImages(data, req.files, "procedureSteps", "procedureStepsImages");
    data.thingsToKnow = JSON.parse(data.thingsToKnow || "[]");
    data.precautionsAftercare = JSON.parse(data.precautionsAftercare || "[]");
    data.faqs = JSON.parse(data.faqs || "[]");

    // Upload main image if exists
    const mainImage = req.files.find((f) => f.fieldname === "image");
    if (mainImage) {
      data.imageUrl = await uploadToSupabase(mainImage);
    }

    if (data.originalPrice && data.price) {
      data.discount = calculateDiscount(data.originalPrice, data.price);
    }

    const service = new Service(data);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    console.error("Create Service Error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// ✅ UPDATE
export const updateService = async (req, res) => {
  try {
    let data = req.body;

    data.overview = await processNestedImages(data, req.files, "overview", "overviewImages");
    data.procedureSteps = await processNestedImages(data, req.files, "procedureSteps", "procedureStepsImages");
    data.thingsToKnow = JSON.parse(data.thingsToKnow || "[]");
    data.precautionsAftercare = JSON.parse(data.precautionsAftercare || "[]");
    data.faqs = JSON.parse(data.faqs || "[]");

    // Upload new main image if provided
    const mainImage = req.files.find((f) => f.fieldname === "image");
    if (mainImage) {
      data.imageUrl = await uploadToSupabase(mainImage);
    }

    if (data.originalPrice && data.price) {
      data.discount = calculateDiscount(data.originalPrice, data.price);
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Service not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update Service Error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// ✅ READ ALL
export const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const services = await Service.find(query)
      .populate("category", "name description imageUrl")
      .populate("subCategory", "name description imageUrl")
      .populate("variety", "name description imageUrl");

    res.json(services);
  } catch (err) {
    console.error("Get Services Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("category", "name description imageUrl")
      .populate("subCategory", "name description imageUrl")
      .populate("variety", "name description imageUrl");

    if (!service) return res.status(404).json({ error: "Service not found" });

    res.json(service);
  } catch (err) {
    console.error("Get Service By ID Error:", err);
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
    console.error("Delete Service Error:", err);
    res.status(500).json({ error: err.message });
  }
};
