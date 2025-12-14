import ComboPackage from "../models/ComboPackage.js";
import Service from "../models/Service.js";
import Banner from "../models/banner.js";

/* =====================================================
   CREATE COMBO
===================================================== */
export const createCombo = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title)
      return res.status(400).json({ error: "Title required" });

    if (!data.services || !data.services.length)
      return res.status(400).json({ error: "Services required" });

    if (!data.price)
      return res.status(400).json({ error: "Price required" });

    // Validate services
    const services = await Service.find({
      _id: { $in: data.services },
    });

    if (services.length !== data.services.length) {
      return res.status(400).json({ error: "Invalid services" });
    }

    // Calculate values
    const originalPrice = services.reduce((s, x) => s + x.price, 0);
    const duration = services.reduce((s, x) => s + x.duration, 0);

    const discount =
      originalPrice > 0
        ? Math.round(((originalPrice - data.price) / originalPrice) * 100)
        : 0;

    const combo = new ComboPackage({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      services: data.services,
      originalPrice,
      price: data.price,
      discount,
      duration,
      btnText: data.btnText || "Book Now",
      isActive: data.isActive ?? true,
    });

    await combo.save();
    res.status(201).json(combo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET ALL COMBOS (LIST PAGE)
===================================================== */
export const getCombos = async (req, res) => {
  try {
    const combos = await ComboPackage.find({ isActive: true })
      .populate("services", "name price duration imageUrl")
      .sort({ createdAt: -1 });

    res.json(combos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/comboController.js
export const getCombosByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) return res.json([]);

    const combos = await ComboPackage.find({
      _id: { $in: ids },
      isActive: true,
    })
      .populate("services", "name price imageUrl")
      .lean();

    const now = new Date();

    // 🔥 attach banner image as imageUrl
    const combosWithImage = await Promise.all(
      combos.map(async (combo) => {
        const banner = await Banner.findOne({
          combo: combo._id,
          isActive: true,
          $or: [
            { schedule: { $exists: false } },
            {
              "schedule.startDate": { $lte: now },
              "schedule.endDate": { $gte: now },
            },
          ],
        }).select("imageUrl");

        return {
          ...combo,
          imageUrl:
            banner?.imageUrl ||
            combo.services?.[0]?.imageUrl || // fallback
            null,
        };
      })
    );

    res.json(combosWithImage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET SINGLE COMBO + BANNER (🔥 IMPORTANT)
===================================================== */
export const getComboById = async (req, res) => {
  try {
    const combo = await ComboPackage.findById(req.params.id).populate({
      path: "services",
      match: { status: "active" },
      select: `
        name
        price
        duration
        imageUrl
        overview
        procedureSteps
        thingsToKnow
        precautionsAftercare
        faqs
      `,
    });

    if (!combo) {
      return res.status(404).json({ error: "Combo not found" });
    }

    const now = new Date();

    // 🔥 Fetch banner linked to this combo
    const banner = await Banner.findOne({
      combo: combo._id,
      isActive: true,
      $or: [
        { schedule: { $exists: false } },
        {
          "schedule.startDate": { $lte: now },
          "schedule.endDate": { $gte: now },
        },
      ],
    }).select("imageUrl btnText title subtitle");

    res.json({
      ...combo.toObject(),
      banner, // 👈 banner auto attach
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* =====================================================
   UPDATE COMBO
===================================================== */
export const updateCombo = async (req, res) => {
  try {
    const data = req.body;

    // Recalculate if services updated
    if (data.services) {
      const services = await Service.find({
        _id: { $in: data.services },
      });

      if (services.length !== data.services.length) {
        return res.status(400).json({ error: "Invalid services" });
      }

      data.originalPrice = services.reduce((s, x) => s + x.price, 0);
      data.duration = services.reduce((s, x) => s + x.duration, 0);

      if (data.price) {
        data.discount = Math.round(
          ((data.originalPrice - data.price) / data.originalPrice) * 100
        );
      }
    }

    const combo = await ComboPackage.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!combo)
      return res.status(404).json({ error: "Combo not found" });

    res.json(combo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   DELETE COMBO
===================================================== */
export const deleteCombo = async (req, res) => {
  try {
    await ComboPackage.findByIdAndDelete(req.params.id);

    res.json({ message: "Combo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
