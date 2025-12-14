import Banner from "../models/banner.js";
import supabase from "../config/supabase.js";
import multer from "multer";

/* =====================================================
   MULTER SETUP
===================================================== */
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/* =====================================================
   HELPER: UPLOAD TO SUPABASE
===================================================== */
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

/* =====================================================
   CREATE BANNER
===================================================== */
export const createBanner = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title)
      return res.status(400).json({ error: "Title required" });

    if (!data.combo)
      return res.status(400).json({ error: "Combo required" });

    if (!req.file)
      return res.status(400).json({ error: "Image required" });

    data.imageUrl = await uploadToSupabase(req.file);

    const banner = new Banner({
      title: data.title,
      subtitle: data.subtitle,
      combo: data.combo,
      btnText: data.btnText || "Book Now",
      imageUrl: data.imageUrl,
      isActive: data.isActive ?? true,
      schedule: data.schedule,
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================================
   GET ALL BANNERS (ADMIN)
===================================================== */
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate("combo", "title price")
      .sort({ createdAt: -1 });

    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET ACTIVE BANNERS (HOME PAGE)
===================================================== */
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $or: [
        { schedule: { $exists: false } },
        {
          "schedule.startDate": { $lte: now },
          "schedule.endDate": { $gte: now },
        },
      ],
    })
      .populate("combo", "title price")
      .sort({ createdAt: -1 });

    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET BANNER BY COMBO (IMPORTANT)
===================================================== */
export const getBannerByCombo = async (req, res) => {
  try {
    const now = new Date();

    const banner = await Banner.findOne({
      combo: req.params.comboId,
      isActive: true,
      $or: [
        { schedule: { $exists: false } },
        {
          "schedule.startDate": { $lte: now },
          "schedule.endDate": { $gte: now },
        },
      ],
    }).select("imageUrl btnText title subtitle");

    res.json(banner); // can be null
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   UPDATE BANNER
===================================================== */
export const updateBanner = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imageUrl = await uploadToSupabase(req.file);
    }

    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Banner not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================================
   DELETE BANNER
===================================================== */
export const deleteBanner = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ error: "Banner not found" });

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
