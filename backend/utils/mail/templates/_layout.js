import dotenv from "dotenv";

dotenv.config();

export default function layoutTemplateMail(bodyContent) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f6f6; font-family:Arial, sans-serif; color:#333;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:20px 0;">
          <!-- Container -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:20px; background:linear-gradient(90deg, rgb(235, 216, 112), #4b2e2e);">
                <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Logo" style="display:block; max-width:64px; height:auto;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                ${bodyContent}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:20px; background-color:#f3f4f6; font-size:12px; color:#6b7280; line-height:1.5;">
                <p style="margin:0; font-weight:bold;">&copy; ${new Date().getFullYear()} My Shop. All rights reserved.</p>
                <p style="margin:0;">📞 06 61 58 53 96</p>
                <p style="margin:0;">🏢 Sidi Maarouf Les Collins, Casablanca</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
