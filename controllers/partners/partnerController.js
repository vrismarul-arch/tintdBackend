import Partner from "../../models/partners/Partner.js";
import supabase from "../../config/supabase.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage
    .from("tintd")
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  if (error) throw error;
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/tintd/${fileName}`;
};

// Submit step data
export const submitStep = async (req, res) => {
  try {
    const { step, partnerId } = req.body;
    let data = { ...req.body };

    // Handle uploaded files
    if (req.files) {
      for (const key in req.files) {
        data[key] = await uploadToSupabase(req.files[key][0]);
      }
    }

    let partner;
    if (partnerId) {
      partner = await Partner.findById(partnerId);
      if (!partner) return res.status(404).json({ error: "Partner not found" });
      Object.assign(partner, data);
    } else {
      partner = new Partner(data);
    }

    switch(step){
      case "Step 1": partner.stepStatus.profileSetup = true; break;
      case "Step 2": partner.stepStatus.documents = true; break;
      case "Step 3": partner.stepStatus.bankInfo = true; break;
      case "Step 4": partner.stepStatus.approval = true; break;
    }

    await partner.save();
    res.status(200).json(partner);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    let updates = { ...req.body };

    // Handle file uploads
    if (req.files) {
      for (const key in req.files) {
        updates[key] = await uploadToSupabase(req.files[key][0]);
      }
    }

    Object.assign(partner, updates);
    await partner.save();

    res.json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};