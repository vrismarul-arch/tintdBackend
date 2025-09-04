import Partner from "../../models/partners/Partner.js";
import nodemailer from "nodemailer";

/* ---------------- Get All Partners ---------------- */
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- Approve Partner ---------------- */
// ...
/* ---------------- Approve Partner ---------------- */
export const approvePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    const partnerId = "tdpartner-" + String(partner._id).slice(-3);
    const defaultPassword = "tintd@123456";

    partner.partnerId = partnerId;
    partner.status = "approved";
    partner.password = defaultPassword; // ✅ hashed by schema

    await partner.save();

    // ---------------- Send Approval Email ----------------
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
      html: `
        <h2>Congratulations ${partner.name}!</h2>
        <p>Your partner application has been approved.</p>
        <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
        <p><strong>Temporary Password:</strong> ${defaultPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <br/>
        <p>Thanks,<br/>Tintd Team 💜</p>
      `,
    });

    res.json({
      message: "Partner approved successfully and email sent",
      partnerId: partner.partnerId,
      defaultPassword,
    });
  } catch (err) {
    console.error("❌ Approve partner error:", err.message);
    res.status(500).json({ error: "Approval failed" });
  }
};


/* ---------------- Reject Partner ---------------- */
export const rejectPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    partner.status = "rejected";
    await partner.save();

    // Send rejection email
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
      html: `
        <h2>Hello ${partner.name},</h2>
        <p>We regret to inform you that your partner application was not approved.</p>
        <p>If you believe this is a mistake, please contact support.</p>
        <br/>
        <p>Thanks,<br/>Tintd Team 💜</p>
      `,
    });

    res.json({ message: "Partner rejected and email sent", partner });
  } catch (err) {
    console.error("Rejection Error:", err);
    res.status(500).json({ error: err.message });
  }
};
