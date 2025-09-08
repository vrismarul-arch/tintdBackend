import Partner from "../../models/partners/Partner.js";
import Counter from "../../models/partners/Counter.js";
import nodemailer from "nodemailer";

// Get all partners (Admin)
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Approve partner
export const approvePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    const counter = await Counter.findOneAndUpdate(
      { name: "partnerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const partnerId = "tdpartner-" + String(counter.seq).padStart(3, "0");
    const defaultPassword = "tintd@123456";

    partner.partnerId = partnerId;
    partner.status = "approved";
    partner.password = defaultPassword; // ensure schema hashes it

    await partner.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tintd Team" <${process.env.MAIL_USER}>`,
      to: partner.email,
      subject: "✅ Partner Application Approved",
      html: `<h2>Congrats ${partner.name}!</h2>
             <p>Partner ID: ${partner.partnerId}</p>
             <p>Temporary Password: ${defaultPassword}</p>`,
    });

    res.json({ message: "Partner approved", partnerId, defaultPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  }
};

// Reject partner
export const rejectPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    partner.status = "rejected";
    await partner.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tintd Team" <${process.env.MAIL_USER}>`,
      to: partner.email,
      subject: "❌ Partner Application Rejected",
      html: `<h2>Hello ${partner.name}</h2>
             <p>Your application was rejected.</p>`,
    });

    res.json({ message: "Partner rejected", partner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
