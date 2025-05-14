const puppeteer = require('puppeteer');

const generatePDF = async (pdfParams) => {
  try {
    const company = pdfParams.companyDetails || {};
    const customer = pdfParams.customerDetails || {};
    const order = pdfParams.orderDetails || {};
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(generateHTML(company, customer, order), {
      waitUntil: 'networkidle0'
    });

    await page.pdf({
      path: `invoice.pdf`,
      format: 'A4',
      printBackground: true,
      margin: { top: '30px', bottom: '30px', left: '20px', right: '20px' }
    });

    console.log('PDF generated successfully!');
    await browser.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

const generateHTML = (company, customer, order) => {
  let s_no = 1;
  const productItems = (order.cartitems || [])
    .filter((item) => item.type === 'product')
    .map((item) => {
      return `
      <tr class="border-b border-gray-200">
        <td class="py-3 px-4 text-center">${s_no++}</td>
        <td class="py-3 px-4 text-center">${item.quantity || 0}</td>
        <td class="py-3 px-4">${item.name || 'Unknown Product'}</td>
        <td class="py-3 px-4 text-right">₹${(item.unitprice || 0).toFixed(
          2
        )}</td>
        <td class="py-3 px-4 text-right">₹${(item.total || 0).toFixed(2)}</td>
      </tr>
      `;
    })
    .join('');
  const giftBoxItems = (order.cartitems || [])
    .filter((item) => item.type === 'giftbox')
    .map((item) => {
      return `
      <tr class="border-b border-gray-200">
        <td class="py-3 px-4 text-center">${s_no++}</td>
        <td class="py-3 px-4 text-center">${item.quantity || 0}</td>
        <td class="py-3 px-4">${item.name || 'Unknown Gift Box'}</td>
        <td class="py-3 px-4 text-right">₹${(item.unitprice || 0).toFixed(
          2
        )}</td>
        <td class="py-3 px-4 text-right">₹${(item.total || 0).toFixed(2)}</td>
      </tr>
      `;
    })
    .join('');

  const totalsHTML =
    order.gst && order.gst.status
      ? `
          <div class="flex justify-between py-2">
            <span class="font-medium">Total (Before GST):</span>
            <span>₹${(order.total || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="font-medium">Discount (${order.discount || 0}%):</span>
            <span>₹${(
              ((order.discount || 0) * (order.total || 0)) /
              100
            ).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="font-medium">GST (${
              order.gst.percentage || 0
            }%):</span>
            <span>₹${(order.gst.amount || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-gray-300 pt-3">
            <span class="font-bold text-lg">Grand Total:</span>
            <span class="font-bold text-lg">₹${(order.grandtotal || 0).toFixed(
              2
            )}</span>
          </div>
        `
      : `
          <div class="flex justify-between py-2">
            <span class="font-medium">Total:</span>
            <span>₹${(order.total || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="font-medium">Discount (${order.discount || 0}%):</span>
            <span>₹${(
              ((order.discount || 0) * (order.total || 0)) /
              100
            ).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-gray-300 pt-3">
            <span class="font-bold text-lg">Grand Total:</span>
            <span class="font-bold text-lg">₹${(order.grandtotal || 0).toFixed(
              2
            )}</span>
          </div>
        `;

  const EstimatedTotal =
    !order.gst || !order.gst.status
      ? `
          <div class="mt-6 text-center bg-blue-50 py-3 rounded-lg">
            <span class="font-bold text-xl text-blue-800">Estimated Total: ₹${(
              order.grandtotal || 0
            ).toFixed(2)}</span>
          </div>
        `
      : '';

  const gstNumberHTML =
    order.gst && order.gst.status && company.gstNumber
      ? `<p class="text-sm">GSTIN: ${company.gstNumber}</p>`
      : '';

  const contactEmailHTML = company.contactEmail
    ? `<p class="text-sm">Email: ${company.contactEmail}</p>`
    : '';
  const contactPhoneHTML = company.contactPhone
    ? `<p class="text-sm">Phone: ${company.contactPhone}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          color: #1F2937;
          margin: 0;
          padding: 0;
          background-color: #F9FAFB;
        }
        .invoice-container {
          max-width: 800px;
          margin: 20px auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #1E40AF;
          color: #FFFFFF;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer {
          background-color: #F3F4F6;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #E5E7EB;
        }
        .table th, .table td {
          padding: 12px 16px;
          text-align: left;
        }
        .table th {
          background-color: #F3F4F6;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
        }
        .table td {
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
          <div>
            <h1 class="text-2xl font-bold mb-1">${
              company.companyname || ''
            }</h1>
            <p class="text-sm">${company.companytagline || ''}</p>
            ${gstNumberHTML}
          </div>
          <div class="text-right">
            <h2 class="text-xl font-semibold">Invoice</h2>
            <p class="text-sm">${
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
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold mb-4">Billed To</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium">${customer.name || ''}</p>
              <p class="text-sm text-gray-600">${customer.address || ''}</p>
              <p class="text-sm text-gray-600">${customer.phone || ''}</p>
            </div>
            <div>
              <p class="font-medium">Customer ID</p>
              <p class="text-sm text-gray-600">${customer._id || ''}</p>
            </div>
          </div>
        </div>

        ${EstimatedTotal}

        <!-- Invoice Items Section -->
        <div class="p-6">
          ${
            productItems
              ? `
          <h3 class="text-lg font-semibold mb-4">Products</h3>
          <table class="table w-full">
            <thead>
              <tr>
                <th class="w-12">S.No</th>
                <th class="w-12">Qty</th>
                <th>Description</th>
                <th class="w-24">Unit Price</th>
                <th class="w-24">Line Total</th>
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
          <h3 class="text-lg font-semibold mt-6 mb-4">Gift Boxes</h3>
          <table class="table w-full">
            <thead>
              <tr>
                <th class="w-12">S.No</th>
                <th class="w-12">Qty</th>
                <th>Description</th>
                <th class="w-24">Unit Price</th>
                <th class="w-24">Line Total</th>
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
        <div class="p-6 bg-gray-50">
          <div class="max-w-xs ml-auto">
            ${totalsHTML}
          </div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <p class="font-medium">${company.personcontact || ''}</p>
          ${contactEmailHTML}
          ${contactPhoneHTML}
          <p class="text-sm text-gray-600 mt-4">${company.shopaddress || ''}</p>
          <p class="text-sm text-gray-500 mt-2">Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generatePDF };
