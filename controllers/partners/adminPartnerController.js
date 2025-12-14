import Partner from "../../models/partners/Partner.js";
import Counter from "../../models/partners/Counter.js";
import transporter from "../../utils/mailer.js"; // centralized mailer config
import bcrypt from "bcryptjs";

/**
 * Get all partners (Admin)
 */
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (err) {
    console.error("Error fetching partners:", err);
    res.status(500).json({ error: "Failed to fetch partners" });
  }
};

/**
 * Approve a partner
 */
export const approvePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner)
      return res.status(404).json({ error: "Partner not found" });

    const counter = await Counter.findOneAndUpdate(
      { name: "partnerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const partnerId = `tintdpartner-${String(counter.seq).padStart(3, "0")}`;
    const defaultPassword = "tintd@123456";

    partner.partnerId = partnerId;
    partner.status = "approved";
    partner.password = defaultPassword; // 🔥 PLAIN PASSWORD ONLY

    await partner.save(); // ✅ hashes once in model

    await transporter.sendMail({
      from: `"Tintd Team" <${process.env.MAIL_USER}>`,
      to: partner.email,
      subject: "Partner Approved",
      html: `
        <p>Hello ${partner.name},</p>
        <p>Your account is approved.</p>
        <p><b>Partner ID:</b> ${partnerId}</p>
        <p><b>Password:</b> ${defaultPassword}</p>
        <p>Please login and change password.</p>
      `,
    });

    res.json({
      message: "Partner approved successfully",
      partnerId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  }
};

/**
 * Reject a partner
 */
export const rejectPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    partner.status = "rejected";
    await partner.save();

    // Send rejection email
    await transporter.sendMail({
      from: `"Tintd Team" <${process.env.MAIL_USER}>`,
      to: partner.email,
      subject: "❌ Partner Application Rejected",
      html: `
        <div style="max-width:600px;margin:auto;padding:20px;background-color:#fff4f4;border-radius:8px;font-family:Arial,sans-serif;color:#333;line-height:1.6;">
          <div style="text-align:center;margin-bottom:20px;">
            <img src="https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/avatars/tintD.png" alt="Tintd Logo" style="width:120px;height:auto;margin-bottom:10px;" />
            <h2 style="color:#c0392b;">❌ Application Rejected</h2>
          </div>
          <p>Hello ${partner.name},</p>
          <p>We regret to inform you that your partner application has been <b>rejected</b>.</p>
          <p>If you believe this was a mistake or would like more details, please reach out to our support team.</p>
          <div style="text-align:center;margin-top:25px;">
            <a href="mailto:support@tintd.in" style="background:#e74c3c;color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;font-weight:bold;">Contact Support</a>
          </div>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;" />
          <p style="text-align:center;font-size:14px;color:#666;">
            Best regards,<br/><b>Tintd Admin Team</b><br/>
            <a href="https://tintd.in" style="color:#e74c3c;text-decoration:none;">tintd.in</a>
          </p>
        </div>
      `,
    });

    res.status(200).json({
      message: "Partner rejected successfully",
      partner,
    });
  } catch (err) {
    console.error("Error rejecting partner:", err);
    res.status(500).json({ error: "Partner rejection failed" });
  }
};