import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatCurrency } from '../../currency-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateInvoicePDF(client, order, product) {
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set page format
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Generate HTML content for the invoice
    const htmlContent = generateInvoiceHTML(client, order, product);
    
    // Set content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture n° ${order.id}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f3f4f6;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .invoice-container {
      width: 210mm;
      height: 297mm;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      padding: 25mm;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between; /* space between header, table, footer */
    }

    .header-bg {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      height: 40mm;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      z-index: 0;
    }

    .logo-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 20px;
      color: #3b82f6;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
    }

    .table-wrapper {
      flex: 1; /* take remaining space */
      display: flex;
      justify-content: center;
      align-items: center; /* center table vertically */
    }
  </style>
</head>
<body>
  <div class="invoice-container relative">
    <!-- Header -->
    <div class="header-bg"></div>
    <div class="relative z-10 flex justify-between items-center mb-8">
      <div class="flex items-center space-x-4">
  <div class="logo-circle">
    <img src="file://${process.cwd().replace(/\\/g, '/')}/public/images/logo.png" alt="Logo" class="w-full h-full object-contain rounded-full" />
  </div>
  <div class="text-white text-3xl font-bold">Ordinateur Store</div>
</div>

      <div class="text-white text-right">
        <p class="text-sm">Ordinateur.Store</p>
        <p class="text-xl font-semibold">FACTURE</p>
      </div>
    </div>

    <!-- Client & Order Info -->
    <div class="flex justify-between mb-6 text-gray-700 text-sm">
      <div>
        <p>Date: <span class="font-medium">19/08/2025</span></p>
        <p>IMEI: <span class="font-medium">N/A</span></p>
      </div>
      <div class="text-right">
        <p>Téléphone: 06 61 58 53 96</p>
        <p>Adresse: Sidi Maarouf, Casablanca</p>
        <p>Email: ordinateurstore.contact@gmail.com</p>
      </div>
    </div>

    <!-- Products Table centered -->
    <div class="table-wrapper">
      <div class="w-full">
        <div class="mb-8 border rounded-lg overflow-hidden shadow-sm">
          <table class="min-w-full bg-white text-sm">
            <thead>
              <tr class="bg-gray-100 border-b border-gray-200">
                <th class="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-left">Description</th>
                <th class="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Quantité</th>
                <th class="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Prix Unitaire</th>
                <th class="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200">
                <td class="px-6 py-4 text-gray-900">
                  <p class="font-medium">${product.name}</p>
                  <ul class="list-disc list-inside text-gray-600 text-xs">
                    ${product.ram ? `<li>Mémoire: ${product.ram}</li>` : ''}
                    ${product.storage ? `<li>Stockage: ${product.storage}</li>` : ''}
                    ${product.graphics ? `<li>Carte graphique: ${product.graphics}</li>` : ''}
                    ${product.processor ? `<li>Processeur: ${product.processor}</li>` : ''}
                  </ul>
                  <p class="text-xs text-gray-500 mt-1">Garantie: 12 mois</p>
                </td>
                <td class="px-6 py-4 text-gray-700 text-right">1</td>
                <td class="px-6 py-4 text-gray-700 text-right">${formatCurrency(order.final_price, order.currency || 'DH', 'fr')}</td>
                <td class="px-6 py-4 text-gray-900 font-semibold text-right">${formatCurrency(order.final_price, order.currency || 'DH', 'fr')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Total Section -->
    <div class="flex justify-end mb-6">
      <div class="text-lg font-bold text-gray-800 text-right">
        Montant Total: <span class="text-blue-600">${formatCurrency(order.final_price, order.currency || 'DH', 'fr')}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-gray-700">
      <p class="font-semibold text-lg">Merci pour votre confiance !</p>
      <p class="text-xs mt-2 italic">Cette facture est émise par Ordinateur Store</p>
    </div>
  </div>
</body>
</html>

`;
}
