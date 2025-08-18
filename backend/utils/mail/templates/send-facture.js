import layoutTemplateMail from "./_layout.js";
import mailer from "../index.js";

export default function sendFactureMail(client, order, product) {
  return mailer.send({
    to: client.email,
    subject: `Invoice for Order #${order.id} 📄`,
    html: layoutTemplateMail(`
      <tr>
        <td style="padding:40px 30px; background-color:#ffffff; text-align:left; color:#333; font-family:Arial, sans-serif; font-size:16px; line-height:1.6;">
          
          <p style="margin:0 0 20px;">
            Hello ${client.full_name},<br>
            Thank you for your order! Your invoice is ready and you can find the details below:
          </p>

          <!-- Invoice Summary -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; border-collapse:collapse;">
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Invoice Number</td>
              <td style="padding:10px; border:1px solid #ddd;">${order.id}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Product</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.name}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Quantity</td>
              <td style="padding:10px; border:1px solid #ddd;">${order.quantity}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Payment Method</td>
              <td style="padding:10px; border:1px solid #ddd;">${order.payment_method}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Total Amount</td>
              <td style="padding:10px; border:1px solid #ddd; color:#4b2e2e; font-weight:bold;">${order.final_price}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Order Date</td>
              <td style="padding:10px; border:1px solid #ddd;">${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          </table>

          <p style="margin-top:30px; font-size:14px; line-height:1.5;">
            If you have any questions about your invoice, feel free to reply to this email or contact us at 📞 06 61 58 53 96.
          </p>
        </td>
      </tr>
    `),
  });
}

