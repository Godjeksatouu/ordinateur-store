import layoutTemplateMail from "./_layout.js";
import mailer from "../index.js";

export default function sendInformOrderMail(client, order, product) {
  return mailer.send({
    to: "web.nafi.web@gmail.com", // only admin
    subject: `🛒 New Order #${order.id} placed by ${client.full_name}`,
    html: layoutTemplateMail(`
      <tr>
        <td style="padding:40px 30px; background-color:#ffffff; text-align:left; color:#333; font-family:Arial, sans-serif; font-size:16px; line-height:1.6;">

          <!-- Client Info -->
          <h3 style="margin:0 0 15px;">Client Information</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; border-collapse:collapse;">
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Full Name</td>
              <td style="padding:10px; border:1px solid #ddd;">${client.full_name}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Email</td>
              <td style="padding:10px; border:1px solid #ddd;">${client.email}</td>
            </tr>
            ${client.phone ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Phone</td>
              <td style="padding:10px; border:1px solid #ddd;">${client.phone}</td>
            </tr>` : ""}
            ${client.address ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Address</td>
              <td style="padding:10px; border:1px solid #ddd;">${client.address}</td>
            </tr>` : ""}
          </table>

          <!-- Order Info -->
          <h3 style="margin:0 0 15px;">Order Information</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; border-collapse:collapse;">
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Order ID</td>
              <td style="padding:10px; border:1px solid #ddd;">${order.id}</td>
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
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Total</td>
              <td style="padding:10px; border:1px solid #ddd; font-weight:bold; color:#4b2e2e;">${order.final_price}</td>
            </tr>
          </table>

          <!-- Product Info -->
          <h3 style="margin:0 0 15px;">Product Information</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; border-collapse:collapse;">
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Product Name</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.name}</td>
            </tr>
            ${product.ram ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">RAM</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.ram}</td>
            </tr>` : ""}
            ${product.storage ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Storage</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.storage}</td>
            </tr>` : ""}
            ${product.screen ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Screen</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.screen}</td>
            </tr>` : ""}
            ${product.graphics ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Graphics</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.graphics}</td>
            </tr>` : ""}
            ${product.processor ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Processor</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.processor}</td>
            </tr>` : ""}
            ${product.os ? `
            <tr>
              <td style="padding:10px; border:1px solid #ddd; background-color:#f9f9f9; font-weight:bold;">Operating System</td>
              <td style="padding:10px; border:1px solid #ddd;">${product.os}</td>
            </tr>` : ""}
          </table>

          <!-- Closing -->
          <p style="margin:0;">This is an internal notification. The client has already received their own order confirmation.</p>

        </td>
      </tr>
    `),
  });
}
