import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import docxPdf from "docx-pdf";

export const generateInvoicePDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      // 1️⃣ Read Word template
      const content = fs.readFileSync(
        "templates/invoice_template.docx",
        "binary"
      );

      // 2️⃣ Unzip DOCX
      const zip = new PizZip(content);

      // 3️⃣ Prepare template engine
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // 4️⃣ DATA PASS (THIS IS KEY)
      doc.render({
        invoice_no: booking.bookingId,
        invoice_date: new Date().toLocaleDateString("en-GB"),

        customer_name: booking.user?.name || booking.name,
        customer_email: booking.user?.email || booking.email,
        customer_phone: booking.user?.phone || booking.phone,
        customer_address: booking.address?.fullAddress,

        total_amount: booking.totalAmount,
        payment_method: booking.paymentMethod,

        items: booking.items.map((item) => ({
          name:
            item.itemType === "service"
              ? item.service?.name
              : item.combo?.title,
          price: item.price || booking.totalAmount,
        })),
      });

      // 5️⃣ Generate DOCX
      const docxBuffer = doc.getZip().generate({
        type: "nodebuffer",
      });

      const docxPath = `invoices/invoice_${booking._id}.docx`;
      fs.writeFileSync(docxPath, docxBuffer);

      // 6️⃣ Convert DOCX → PDF
      const pdfPath = `invoices/invoice_${booking._id}.pdf`;

      docxPdf(docxPath, pdfPath, (err) => {
        if (err) reject(err);
        else resolve(pdfPath);
      });
    } catch (err) {
      reject(err);
    }
  });
};
