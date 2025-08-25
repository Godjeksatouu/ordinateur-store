import puppeteer from "puppeteer";
import { formatCurrency } from "../../currency-utils.js";
import dotenv from "dotenv";

dotenv.config();

export async function generateInvoicePDF(client, order, product) {
  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set page format
    await page.setViewport({ width: 1200, height: 1600 });

    // Generate HTML content for the invoice
    const htmlContent = generateInvoiceHTML(client, order, product);

    // Set content
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateInvoiceHTML(client, order, product) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture n° ${order.id}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4;}
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 0;
    }
    .invoice-container {
      width: 210mm;
      min-height: 297mm;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 20mm;
      box-sizing: border-box;
      margin: 0 auto;
    }
    .table-container { overflow-x: auto; }
  </style>
</head>
<body>
  <div class="invoice-container">

    <!-- Header info (no gradient bar) -->
    <div class="flex justify-between items-center mb-8">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
          <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Logo" class="w-12 h-12 object-contain" />
        </div>
        <h1 class="text-3xl font-bold text-[#4b2e2e]">Ordinateur Store</h1>
      </div>
      <div class="text-right text-[#4b2e2e]">
        <p class="text-sm">Ordinateur.Store</p>
        <p class="text-xl font-semibold">FACTURE</p>
      </div>
    </div>

    <!-- Client & Order Info -->
    <div class="flex justify-between mb-6 text-gray-700 text-sm">
      <div>
        <p>logo url: ${process.env.FRONTEND_URL}/images/logo.png</p>
        <p>Client: <span class="font-medium">${client.full_name}</span></p>
        <p>Facture n°: <span class="font-medium">${order.id}</span></p>
        <p>Date: <span class="font-medium">${new Intl.DateTimeFormat(["ban", "id"]).format(order.created_at)}</span></p>
      </div>
      <div class="text-right">
        <p>Téléphone: 06 61 58 53 96</p>
        <p>Adresse: Sidi Maarouf, Casablanca</p>
        <p>Email: ordinateurstore.contact@gmail.com</p>
      </div>
    </div>

    <!-- Products Table -->
    <div class="table-container">
      <table class="min-w-full bg-white rounded-lg shadow-md text-sm mt-32">
        <thead>
          <tr class="bg-[#ebd870] text-[#4b2e2e] uppercase text-left">
            <th class="px-6 py-3 font-semibold">Description</th>
            <th class="px-6 py-3 font-semibold text-right">Quantité</th>
            <th class="px-6 py-3 font-semibold text-right">Prix Unitaire</th>
            <th class="px-6 py-3 font-semibold text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b">
            <td class="px-6 py-4">
              <p class="font-medium">${product?.name || "Produit"}</p>
              ${
                product?.ram ||
                product?.storage ||
                product?.graphics ||
                product?.processor ||
                product?.os
                  ? `
              <ul class="list-disc list-inside text-gray-600 text-xs mt-1">
                ${product.ram ? `<li>Mémoire: ${product.ram}</li>` : ""}
                ${product.storage ? `<li>Stockage: ${product.storage}</li>` : ""}
                ${product.graphics ? `<li>Carte graphique: ${product.graphics}</li>` : ""}
                ${product.processor ? `<li>Processeur: ${product.processor}</li>` : ""}
                ${product.os ? `<li>Système: ${product.os}</li>` : ""}
              </ul>
              `
                  : `
              <p class="text-gray-600 text-xs mt-1">${product?.description || "Accessoire de qualité"}</p>
              `
              }
              <p class="text-xs text-gray-500 mt-1">Garantie: 12 mois</p>
            </td>
            <td class="px-6 py-4 text-right">${order.quantity}</td>
            <td class="px-6 py-4 text-right">${formatCurrency(order.final_price, order.currency || "DH", "fr")}</td>
            <td class="px-6 py-4 text-right font-semibold">${formatCurrency(order.final_price, order.currency || "DH", "fr")}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div class="flex justify-end mt-6">
      <p class="text-lg font-bold text-[#4b2e2e]">
        Montant Total: <span class="text-[#ebd870]">${formatCurrency(order.final_price, order.currency || "DH", "fr")}</span>
      </p>
    </div>

    <!-- Footer -->
    <div class="text-center text-gray-700 mt-64">
      <p class="font-semibold text-lg">Merci pour votre confiance !</p>
      <p class="text-xs mt-2 italic">Cette facture est émise par Ordinateur Store</p>
    </div>

  </div>
</body>
</html>`;
}
