import Partner from "../../models/partners/Partner.js";
import transporter from "../../utils/mailer.js";

/* ===============================
   📌 SEND OTP
================================ */
export const forgotPartnerPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    // 🔢 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    partner.resetOtp = otp;
    partner.resetOtpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await partner.save();

    /* ===============================
       📧 ADVANCED OTP EMAIL TEMPLATE
    ================================ */
    await transporter.sendMail({
      from: `"Tintd Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Tintd Partner – Password Reset OTP",
      html: `
      <div style="background-color:#f4f6fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:480px;background:#ffffff;border-radius:12px;
          overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="padding:24px;text-align:center;background:#7c3aed;">
              <img
                src="https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/tintdw.png"
                alt="Tintd"
                width="120"
                style="display:block;margin:0 auto;"
              />
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px 28px;">
              <h2 style="margin:0 0 12px;color:#111827;">
                Password Reset Request
              </h2>

              <p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.6;">
                We received a request to reset your <b>Tintd Partner</b> account password.
                Please use the One-Time Password (OTP) below to continue.
              </p>

              <!-- OTP BOX -->
              <div style="
                margin:24px 0;
                padding:18px;
                text-align:center;
                border-radius:10px;
                background:#f5f3ff;
                border:1px dashed #7c3aed;
              ">
                <p style="margin:0;color:#6b7280;font-size:13px;">
                  Your OTP Code
                </p>

                <h1 style="
                  margin:10px 0 0;
                  letter-spacing:6px;
                  font-size:32px;
                  color:#7c3aed;
                ">
                  ${otp}
                </h1>
              </div>

              <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                ⏱ This OTP is valid for <b>5 minutes</b>.
              </p>

              <p style="margin:0;color:#9ca3af;font-size:13px;">
                If you didn’t request this password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="
              padding:16px;
              text-align:center;
              font-size:12px;
              color:#9ca3af;
              background:#f9fafb;
            ">
              © ${new Date().getFullYear()} Tintd. All rights reserved.
            </td>
          </tr>

        </table>
      </div>
      `,
    });

    return res.json({ message: "OTP sent to registered email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};


/* ===============================
   📌 VERIFY OTP
================================ */
export const verifyPartnerResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const partner = await Partner.findOne({
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!partner)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    res.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===============================
   📌 RESET PASSWORD
================================ */
export const resetPartnerPasswordOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const partner = await Partner.findOne({
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!partner)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    partner.password = password;
    partner.resetOtp = undefined;
    partner.resetOtpExpire = undefined;

    await partner.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
