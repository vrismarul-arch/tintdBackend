import Service from "../models/Service.js";
import supabase from "../config/supabase.js";
import multer from "multer";

// multer memory
const storage = multer.memoryStorage();
export const upload = multer({ storage });

const calculateDiscount = (originalPrice, price) => {
  if (!originalPrice || !price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

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

// ⭐ SAFE NESTED IMAGE HANDLER
const processNestedImages = async (data, files = [], field, fileFieldName) => {
  try {
    files = Array.isArray(files) ? files : [];
    if (!data[field]) return [];

    let arr;
    try {
      arr = JSON.parse(data[field]);
    } catch {
      arr = data[field];
    }

    if (!Array.isArray(arr)) return [];

    return Promise.all(
      arr.map(async (item, idx) => {
        // keep old image URL
        if (item.img && typeof item.img === "string" && item.img.startsWith("http")) {
          return item;
        }

        const uploaded = files.find((f) => f.fieldname === `${fileFieldName}_${idx}`);
        if (uploaded) {
          const url = await uploadToSupabase(uploaded);
          return { ...item, img: url };
        }

        return item;
      })
    );
  } catch (err) {
    console.log("processNestedImages error:", err);
    return [];
  }
};

// CREATE
export const createService = async (req, res) => {
  try {
    let data = req.body;
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    data.overview = await processNestedImages(data, uploadedFiles, "overview", "overviewImages");
    data.procedureSteps = await processNestedImages(data, uploadedFiles, "procedureSteps", "procedureStepsImages");

    data.thingsToKnow = JSON.parse(data.thingsToKnow || "[]");
    data.precautionsAftercare = JSON.parse(data.precautionsAftercare || "[]");
    data.faqs = JSON.parse(data.faqs || "[]");

    const mainImage = uploadedFiles.find((f) => f.fieldname === "image");
    if (mainImage) data.imageUrl = await uploadToSupabase(mainImage);

    if (data.originalPrice && data.price) {
      data.discount = calculateDiscount(data.originalPrice, data.price);
    }

    const service = new Service(data);
    await service.save();

    res.status(201).json(service);
  } catch (err) {
    console.error("Create Service Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateService = async (req, res) => {
  try {
    let data = req.body;
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    data.overview = await processNestedImages(data, uploadedFiles, "overview", "overviewImages");
    data.procedureSteps = await processNestedImages(data, uploadedFiles, "procedureSteps", "procedureStepsImages");

    data.thingsToKnow = JSON.parse(data.thingsToKnow || "[]");
    data.precautionsAftercare = JSON.parse(data.precautionsAftercare || "[]");
    data.faqs = JSON.parse(data.faqs || "[]");

    const mainImage = uploadedFiles.find((f) => f.fieldname === "image");
    if (mainImage) data.imageUrl = await uploadToSupabase(mainImage);

    if (data.originalPrice && data.price) {
      data.discount = calculateDiscount(data.originalPrice, data.price);
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: "Service not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update Service Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ⭐ GET SERVICES WITH STATUS FILTER
export const getServices = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (status && status !== "all") query.status = status;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

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

// GET ONE
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

// HARD DELETE
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

// Multi-ID fetch (cart)
export const getServicesByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid service IDs" });
    }

    const services = await Service.find({ _id: { $in: ids } })
      .select("name price imageUrl");

    res.json(services);
  } catch (err) {
    console.error("Get Services IDs Error:", err);
    res.status(500).json({ error: err.message });
  }
};
