import layoutTemplateMail from "./_layout.js";
import mailer from "../index.js";
import { generateInvoicePDF } from "../../pdf/invoice-generator.js";
import { formatCurrency } from "../../../currency-utils.js";

export default async function sendFactureMail(client, order, product, reviewLink) {
  try {
    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(client, order, product);

    return mailer.send({
      to: [client.email, 'web.nafi.web@gmail.com'],
      subject: `فاتورة طلبك #${order.id} - Ordinateur Store 📄`,
      html: layoutTemplateMail(`
        <tr>
          <td style="padding:30px 20px; background-color:#ffffff; text-align:center; color:#333; font-family:Arial, sans-serif; font-size:16px; line-height:1.6;">

            <!-- Header with Logo -->
            <div style="text-align:center; margin-bottom:25px;">
              <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Ordinateur Store" style="width:60px; height:60px; object-fit:contain; display:block; margin:0 auto 8px;" />
              <h2 style="color:#2563eb; margin:0; font-size:22px;">Ordinateur Store</h2>
            </div>

            <!-- Thank You Message -->
            <div style="background:linear-gradient(135deg, #2563eb, #1d4ed8); color:white; padding:20px; border-radius:10px; margin-bottom:25px;">
              <h3 style="margin:0 0 10px; font-size:18px;">✅ Order Delivered Successfully</h3>
              <p style="margin:0; font-size:15px;">Thank you for choosing Ordinateur Store!</p>
            </div>

            <!-- Order Summary -->
            <div style="background:#f8fafc; padding:18px; border-radius:8px; margin-bottom:20px; text-align:center;">
              <h4 style="color:#374151; margin:0 0 12px; font-size:16px;">Order #${order.id}</h4>
              <p style="margin:0; font-size:17px; color:#2563eb; font-weight:bold;">${product.name}</p>
              <p style="margin:8px 0 0; font-size:18px; color:#059669; font-weight:bold;">Total: ${formatCurrency(order.final_price, order.currency || 'DH', 'en')}</p>
            </div>

            <!-- Review Request -->
            ${reviewLink ? `
            <div style="background:#f0f9ff; border:1px solid #0ea5e9; padding:18px; border-radius:8px; margin-bottom:20px; text-align:center;">
              <p style="margin:0 0 12px; color:#0c4a6e; font-weight:bold;">⭐ Share Your Experience</p>
              <p style="margin:0 0 15px; color:#0c4a6e; font-size:14px;">Help other customers by leaving a review</p>
              <a href="${reviewLink}" style="display:inline-block; background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold; font-size:14px;">Leave a Review</a>
            </div>
            ` : ''}

            <!-- Warranty Notice -->
            <div style="background:#fef3c7; border:1px solid #f59e0b; padding:12px; border-radius:6px; margin-bottom:20px; text-align:center;">
              <p style="margin:0; color:#92400e; font-weight:bold; font-size:14px;">📋 Warranty invoice attached</p>
            </div>

            <!-- Contact -->
            <div style="text-align:center; color:#6b7280; font-size:13px;">
              <p style="margin:0;">📧 ordinateurstore.contact@gmail.com</p>
            </div>
          </td>
        </tr>
      `),
      attachments: [
        {
          filename: `فاتورة-${order.id}-Ordinateur-Store.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  } catch (error) {
    console.error('Error generating PDF or sending email:', error);
    throw error;
  }
}

