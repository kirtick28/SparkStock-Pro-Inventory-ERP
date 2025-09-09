const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generatePDF = async (pdfParams, retryCount = 0) => {
  let page = null;
  let browser = null;
  const startTime = Date.now();
  const maxRetries = 1;

  try {
    console.log(`Starting PDF generation (attempt ${retryCount + 1})...`);
    const company = pdfParams.companyDetails || {};
    const customer = pdfParams.customerDetails || {};
    const order = pdfParams.orderDetails || {};

    // Launch a fresh browser instance for each PDF generation to avoid connection issues
    console.log('Launching fresh browser instance...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      timeout: 30000
    });

    page = await browser.newPage();

    // Set larger viewport and timeouts
    await page.setViewport({ width: 794, height: 1123 });
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);

    const htmlContent = generateHTML(company, customer, order);
    console.log('HTML content generated, setting page content...');

    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Waiting for page to be ready...');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for content to fully render

    console.log('Generating PDF...');

    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const customerName = (customer.name || 'customer').replace(
      /[^a-zA-Z0-9]/g,
      '_'
    );
    const filename = `invoice_${customerName}_${timestamp}.pdf`;
    const filepath = path.join(invoicesDir, filename);

    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
      preferCSSPageSize: false
    });

    console.log(`PDF generated successfully in ${Date.now() - startTime}ms!`);
    console.log(`PDF saved to: ${filepath}`);

    return {
      success: true,
      filepath: filepath,
      filename: filename
    };
  } catch (error) {
    console.error(
      `PDF generation error (attempt ${retryCount + 1}):`,
      error.message
    );

    if (retryCount < maxRetries) {
      console.log(`Retrying PDF generation...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return await generatePDF(pdfParams, retryCount + 1);
    }

    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    // Always close browser and page
    if (page && !page.isClosed()) {
      try {
        await page.close();
      } catch (closeError) {
        console.log('Error closing page:', closeError.message);
      }
    }

    if (browser && browser.isConnected()) {
      try {
        await browser.close();
      } catch (closeError) {
        console.log('Error closing browser:', closeError.message);
      }
    }
  }
};

module.exports = { generatePDF };

const generateHTML = (company, customer, order) => {
  let s_no = 1;
  const productItems = (order.cartitems || [])
    .filter((item) => item.type === 'product')
    .map((item) => {
      return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; text-align: center;">${s_no++}</td>
        <td style="padding: 12px 16px; text-align: center;">${
          item.quantity || 0
        }</td>
        <td style="padding: 12px 16px;">${item.name || 'Unknown Product'}</td>
        <td style="padding: 12px 16px; text-align: right;">₹${(
          item.unitprice || 0
        ).toFixed(2)}</td>
        <td style="padding: 12px 16px; text-align: right;">₹${(
          item.total || 0
        ).toFixed(2)}</td>
      </tr>
      `;
    })
    .join('');

  const giftBoxItems = (order.cartitems || [])
    .filter((item) => item.type === 'giftbox')
    .map((item) => {
      return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; text-align: center;">${s_no++}</td>
        <td style="padding: 12px 16px; text-align: center;">${
          item.quantity || 0
        }</td>
        <td style="padding: 12px 16px;">${item.name || 'Unknown Gift Box'}</td>
        <td style="padding: 12px 16px; text-align: right;">₹${(
          item.unitprice || 0
        ).toFixed(2)}</td>
        <td style="padding: 12px 16px; text-align: right;">₹${(
          item.total || 0
        ).toFixed(2)}</td>
      </tr>
      `;
    })
    .join('');

  const totalsHTML =
    order.gst && order.gst.status
      ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: 500;">Total (Before GST):</span>
            <span>₹${(order.total || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: 500;">Discount (${
              order.discount || 0
            }%):</span>
            <span>₹${(
              ((order.discount || 0) * (order.total || 0)) /
              100
            ).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: 500;">GST (${
              order.gst.percentage || 0
            }%):</span>
            <span>₹${(order.gst.amount || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #d1d5db; margin-top: 12px;">
            <span style="font-weight: 700; font-size: 18px;">Grand Total:</span>
            <span style="font-weight: 700; font-size: 18px;">₹${(
              order.grandtotal || 0
            ).toFixed(2)}</span>
          </div>
        `
      : `
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: 500;">Total:</span>
            <span>₹${(order.total || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: 500;">Discount (${
              order.discount || 0
            }%):</span>
            <span>₹${(
              ((order.discount || 0) * (order.total || 0)) /
              100
            ).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #d1d5db; margin-top: 12px;">
            <span style="font-weight: 700; font-size: 18px;">Grand Total:</span>
            <span style="font-weight: 700; font-size: 18px;">₹${(
              order.grandtotal || 0
            ).toFixed(2)}</span>
          </div>
        `;

  const EstimatedTotal =
    !order.gst || !order.gst.status
      ? `
          <div style="margin-top: 24px; text-align: center; background-color: #dbeafe; padding: 12px; border-radius: 8px;">
            <span style="font-weight: 700; font-size: 20px; color: #1e40af;">Estimated Total: ₹${(
              order.grandtotal || 0
            ).toFixed(2)}</span>
          </div>
        `
      : '';

  const gstNumberHTML =
    order.gst && order.gst.status && company.gstNumber
      ? `<p style="font-size: 14px; margin: 4px 0;">GSTIN: ${company.gstNumber}</p>`
      : '';

  const contactEmailHTML = company.contactEmail
    ? `<p style="font-size: 14px; margin: 4px 0;">Email: ${company.contactEmail}</p>`
    : '';
  const contactPhoneHTML = company.contactPhone
    ? `<p style="font-size: 14px; margin: 4px 0;">Phone: ${company.contactPhone}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          color: #1f2937;
          background-color: #f9fafb;
          line-height: 1.6;
        }
        .invoice-container {
          max-width: 800px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #1e40af;
          color: #ffffff;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .header-left p {
          font-size: 14px;
          margin: 2px 0;
        }
        .header-right {
          text-align: right;
        }
        .header-right h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .customer-section {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .customer-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .customer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .customer-info p {
          margin: 4px 0;
          font-size: 14px;
        }
        .customer-info .font-medium {
          font-weight: 500;
        }
        .customer-info .text-gray-600 {
          color: #6b7280;
        }
        .items-section {
          padding: 24px;
        }
        .items-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .table th {
          background-color: #f3f4f6;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        .table td {
          font-size: 14px;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        .totals-section {
          padding: 24px;
          background-color: #f9fafb;
        }
        .totals-container {
          max-width: 300px;
          margin-left: auto;
        }
        .footer {
          background-color: #f3f4f6;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 4px 0;
          font-size: 14px;
        }
        .footer .font-medium {
          font-weight: 500;
        }
        .footer .text-gray-600 {
          color: #6b7280;
        }
        .footer .text-gray-500 {
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
          <div class="header-left">
            <h1>${company.companyname || ''}</h1>
            <p>${company.companytagline || ''}</p>
            ${gstNumberHTML}
          </div>
          <div class="header-right">
            <h2>Invoice</h2>
            <p>${
              order.createdat
                ? new Date(order.createdat).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : ''
            }</p>
          </div>
        </div>

        <!-- Customer Information Section -->
        <div class="customer-section">
          <h3>Billed To</h3>
          <div class="customer-grid">
            <div class="customer-info">
              <p class="font-medium">${customer.name || ''}</p>
              <p class="text-gray-600">${customer.address || ''}</p>
              <p class="text-gray-600">${customer.phone || ''}</p>
            </div>
            <div class="customer-info">
              <p class="font-medium">Customer ID</p>
              <p class="text-gray-600">${customer._id || ''}</p>
            </div>
          </div>
        </div>

        ${EstimatedTotal}

        <!-- Invoice Items Section -->
        <div class="items-section">
          ${
            productItems
              ? `
          <h3>Products</h3>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 60px;">S.No</th>
                <th style="width: 60px;">Qty</th>
                <th>Description</th>
                <th style="width: 100px;">Unit Price</th>
                <th style="width: 100px;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${productItems}
            </tbody>
          </table>`
              : ''
          }
          
          ${
            giftBoxItems
              ? `
          <h3 style="margin-top: 24px;">Gift Boxes</h3>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 60px;">S.No</th>
                <th style="width: 60px;">Qty</th>
                <th>Description</th>
                <th style="width: 100px;">Unit Price</th>
                <th style="width: 100px;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${giftBoxItems}
            </tbody>
          </table>`
              : ''
          }
        </div>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-container">
            ${totalsHTML}
          </div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <p class="font-medium">${company.personcontact || ''}</p>
          ${contactEmailHTML}
          ${contactPhoneHTML}
          <p class="text-gray-600" style="margin-top: 16px;">${
            company.shopaddress || ''
          }</p>
          <p class="text-gray-500" style="margin-top: 8px;">Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generatePDF };
