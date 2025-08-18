import layoutTemplateMail from "./_layout.js";
import mailer from "../index.js";

export default function sendOrderMadeMail(client, order, product) {
  return mailer.send({
    to: client.email,
    subject: `Your Order #${order.id} has been placed 🛒`,
    html: layoutTemplateMail(`
      <tr>
        <td style="padding:40px 30px; background-color:#ffffff; text-align:left; color:#333; font-family:Arial, sans-serif; font-size:16px; line-height:1.6;">

          <!-- Greeting -->
          <p style="margin:0 0 20px;">Dear ${client.full_name},</p>

          <!-- Main Message -->
          <p style="margin:0 0 20px;">
            We’re excited to let you know that your order has been successfully placed! Here are the details of your product:
          </p>

          <!-- Product Details Table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; border-collapse:collapse;">
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Product Name</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.name}</td>
            </tr>
            ${product.ram ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">RAM</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.ram}</td>
            </tr>` : ''}
            ${product.storage ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Storage</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.storage}</td>
            </tr>` : ''}
            ${product.screen ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Screen</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.screen}</td>
            </tr>` : ''}
            ${product.graphics ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Graphics</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.graphics}</td>
            </tr>` : ''}
            ${product.processor ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Processor</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.processor}</td>
            </tr>` : ''}
            ${product.os ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Operating System</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.os}</td>
            </tr>` : ''}
          </table>

          <!-- Order Summary Table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; border-collapse:collapse;">
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Quantity</td>
              <td style="padding:10px; border:1px solid #ddd;">${order.quantity}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Payment Method</td>
              <td style="padding:10px; border:1px solid #ddd;">${order.payment_method}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Total</td>
              <td style="padding:10px; border:1px solid #ddd; color:#4b2e2e; font-weight:bold;">${order.final_price}</td>
            </tr>
          </table>

          <!-- Closing -->
          <p style="margin:0 0 20px;">
            Thank you for shopping with us!<br>
            If you have any questions, feel free to contact our support.
          </p>

          <p style="margin:0;">Best regards,<br><strong>Ordinateur Store Company Team</strong></p>
        </td>
      </tr>
    `),
  });
}

