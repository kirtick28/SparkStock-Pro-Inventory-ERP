const { generatePDF } = require('../utils/GenerateInvoice');
const { uploadPDFToCloudinary } = require('../utils/uploadPdf');
const {
  Order,
  Customer,
  Product,
  Company,
  GiftBox,
  Cart
} = require('../utils/modelUtil');
const mongoose = require('mongoose');
const fs = require('fs').promises;

exports.placeOrder = async (req, res) => {
  try {
    const {
      id,
      products,
      giftboxes,
      discount,
      total,
      grandtotal,
      gst,
      customerInfo
    } = req.body;

    console.log('Order request data:', {
      id,
      products: products?.length || 0,
      giftboxes: giftboxes?.length || 0,
      discount,
      total,
      grandtotal,
      gst,
      customerInfo: customerInfo
        ? { name: customerInfo.name, hasPhone: !!customerInfo.phone }
        : null
    });

    // Enhanced validation
    if (!products || !Array.isArray(products) || products.length === 0) {
      if (!giftboxes || !Array.isArray(giftboxes) || giftboxes.length === 0) {
        return res
          .status(400)
          .json({ message: 'At least one product or gift box is required' });
      }
    }

    if (
      discount === undefined ||
      total === undefined ||
      grandtotal === undefined ||
      !gst
    ) {
      return res.status(400).json({
        message: 'Missing required fields: discount, total, grandtotal, gst'
      });
    }

    // Validate numeric values
    const discountNum = parseFloat(discount);
    const totalNum = parseFloat(total);
    const grandtotalNum = parseFloat(grandtotal);

    if (isNaN(discountNum) || isNaN(totalNum) || isNaN(grandtotalNum)) {
      return res.status(400).json({
        message: 'Invalid numeric values for discount, total, or grandtotal'
      });
    }

    if (discountNum < 0 || totalNum < 0 || grandtotalNum < 0) {
      return res.status(400).json({
        message: 'Discount, total, and grandtotal must be non-negative'
      });
    }

    const gstAmount = gst.amount ? parseFloat(gst.amount) : 0;
    if (gst.status && (isNaN(gstAmount) || gstAmount < 0)) {
      return res.status(400).json({ message: 'Invalid GST amount' });
    }

    // Get company details
    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company details not found' });
    }

    // Add company status check
    if (req.user.role !== 'superadmin' && !company.status) {
      return res.status(403).json({
        message: 'Company is not active. Please contact support.'
      });
    }

    let customer = null;
    let customerData = null;

    // Handle customer scenarios
    if (id) {
      // Existing customer scenario
      console.log('Processing existing customer with ID:', id);
      customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      customerData = {
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || ''
      };
      console.log('Existing customer loaded:', customer.name);
    } else if (customerInfo && customerInfo.name && customerInfo.name.trim()) {
      // New customer scenario - create customer if enough info provided
      console.log('Processing new customer:', customerInfo.name);
      const newCustomerData = {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone?.trim() || '',
        address: customerInfo.address?.trim() || '',
        city: customerInfo.city?.trim() || '',
        state: customerInfo.state?.trim() || '',
        pincode: customerInfo.pincode?.trim() || '',
        companyId: company._id
      };

      // Create new customer if we have at least name and either phone or address
      if (
        newCustomerData.name &&
        (newCustomerData.phone || newCustomerData.address)
      ) {
        try {
          customer = new Customer(newCustomerData);
          await customer.save();
          customerData = newCustomerData;
          console.log('New customer created:', customer.name);
        } catch (error) {
          console.error('Error creating new customer:', error);
          // If customer creation fails, continue with walk-in customer
          customerData = newCustomerData;
          console.log('Customer creation failed, using as walk-in customer');
        }
      } else {
        customerData = newCustomerData;
        console.log('Insufficient customer data, using as temporary customer');
      }
    } else {
      // Walk-in customer scenario
      console.log('Processing walk-in customer');
      customerData = {
        name: 'Walk-in Customer',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      };
    }

    const cartItems = [];

    // Process products
    if (products && Array.isArray(products) && products.length > 0) {
      for (const item of products) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity < 1) {
          return res.status(400).json({
            message: `Invalid product data: productId and quantity are required`
          });
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 1) {
          return res.status(400).json({
            message: `Invalid quantity for product: ${productId}`
          });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            message: `Product not found: ${productId}`
          });
        }

        if (product.stockavailable < quantityNum) {
          return res.status(400).json({
            message: `Insufficient stock for product: ${product.name}. Available: ${product.stockavailable}, Requested: ${quantityNum}`
          });
        }

        const itemTotal = quantityNum * product.price;

        // Update product stock and sales
        await Product.findByIdAndUpdate(productId, {
          $inc: {
            stockavailable: -quantityNum,
            totalsales: quantityNum,
            totalrevenue: itemTotal
          }
        });

        cartItems.push({
          id: product._id,
          name: product.name,
          unitprice: product.price,
          quantity: quantityNum,
          total: itemTotal,
          type: 'product'
        });
      }
    }

    // Process gift boxes
    if (giftboxes && Array.isArray(giftboxes) && giftboxes.length > 0) {
      for (const box of giftboxes) {
        const { giftBoxId, quantity } = box;

        if (!giftBoxId || !quantity || quantity < 1) {
          return res.status(400).json({
            message: `Invalid gift box data: giftBoxId and quantity are required`
          });
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 1) {
          return res.status(400).json({
            message: `Invalid quantity for gift box: ${giftBoxId}`
          });
        }

        const giftBox = await GiftBox.findById(giftBoxId);
        if (!giftBox) {
          return res.status(404).json({
            message: `GiftBox not found: ${giftBoxId}`
          });
        }

        if (giftBox.stockavailable < quantityNum) {
          return res.status(400).json({
            message: `Insufficient stock for gift box: ${giftBox.name}. Available: ${giftBox.stockavailable}, Requested: ${quantityNum}`
          });
        }

        const boxTotal = quantityNum * giftBox.grandtotal;

        // Update gift box stock and sales
        await GiftBox.findByIdAndUpdate(giftBoxId, {
          $inc: {
            stockavailable: -quantityNum,
            totalsales: quantityNum,
            totalrevenue: boxTotal
          }
        });

        cartItems.push({
          id: giftBox._id,
          name: giftBox.name,
          unitprice: giftBox.grandtotal,
          quantity: quantityNum,
          total: boxTotal,
          type: 'giftbox'
        });
      }
    }

    // Create order
    const order = new Order({
      companyId: company._id,
      customer: customer ? customer._id : null,
      cartitems: products
        ? products.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity)
          }))
        : [],
      giftboxes: giftboxes
        ? giftboxes.map((box) => ({
            giftBoxId: box.giftBoxId,
            quantity: parseInt(box.quantity)
          }))
        : [],
      discount: discountNum,
      total: totalNum,
      grandtotal: grandtotalNum,
      gst: {
        status: gst.status,
        percentage: gst.status ? parseFloat(gst.percentage) || 0 : 0,
        amount: gst.status ? gstAmount : 0
      },
      customerInfo: customer ? null : customerData
    });

    const savedOrder = await order.save();

    // Update customer orders if it's a registered customer
    if (customer) {
      await Customer.findByIdAndUpdate(customer._id, {
        $push: { orders: { id: savedOrder._id } }
      });
    }

    // Delete cart if it's for an existing customer
    if (id) {
      Cart.deleteOne({ id }).catch((err) =>
        console.error('Error deleting cart:', err)
      );
    }

    const orderDetails = {
      cartitems: cartItems,
      discount: savedOrder.discount,
      total: savedOrder.total,
      grandtotal: savedOrder.grandtotal,
      gst: savedOrder.gst,
      createdat: savedOrder.createdat
    };

    const pdfParams = {
      companyDetails: company,
      customerDetails: customerData,
      orderDetails
    };

    // Generate PDF asynchronously to improve response time
    const pdfPromise = generateAndUploadPDF(
      pdfParams,
      company,
      customerData,
      savedOrder._id
    );

    // Start PDF generation but don't wait for it
    pdfPromise
      .then((pdfUrl) => {
        // PDF generated successfully, update order with URL
        Order.findByIdAndUpdate(savedOrder._id, { invoicepdf: pdfUrl }).catch(
          (err) => console.error('Error updating order with PDF URL:', err)
        );
        console.log(
          `PDF generated and uploaded successfully for order ${savedOrder._id}: ${pdfUrl}`
        );
      })
      .catch((err) => {
        console.error(
          'PDF generation failed for order:',
          savedOrder._id,
          err.message
        );
        // Mark order with error status for retry later
        Order.findByIdAndUpdate(savedOrder._id, {
          pdfError: err.message,
          pdfGenerationAttempts: 1
        }).catch(console.error);
      });

    res.status(200).json({
      message: 'Order placed successfully. Invoice is being generated.',
      orderId: savedOrder._id,
      pdfUrl: null, // Will be available shortly
      customerType: customer
        ? 'existing'
        : customerInfo &&
          customerInfo.name &&
          customerInfo.name.trim() &&
          customerInfo.name !== 'Walk-in Customer'
        ? 'new'
        : 'walkin'
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      message: 'Error placing order',
      error: error.message
    });
  }
};

// Separate function for PDF generation and upload
const generateAndUploadPDF = async (
  pdfParams,
  company,
  customerData,
  orderId
) => {
  const startTime = Date.now();
  console.log(`Starting PDF generation for order ${orderId}...`);

  try {
    // Generate PDF using Puppeteer
    const pdfResult = await generatePDF(pdfParams);

    if (!pdfResult.success) {
      throw new Error('PDF generation failed');
    }

    console.log(
      `PDF generated successfully in ${
        Date.now() - startTime
      }ms for order ${orderId}`
    );
    console.log(`PDF saved at: ${pdfResult.filepath}`);

    // Upload to Cloudinary with timeout
    const uploadStartTime = Date.now();
    console.log(`Starting Cloudinary upload for order ${orderId}...`);

    const uploadPromise = uploadPDFToCloudinary(
      pdfResult.filepath,
      company.companyname || 'Unknown_Company',
      customerData.name || 'Unknown_Customer'
    );

    const uploadTimeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(() => reject(new Error('Cloudinary upload timeout')), 60000) // 60 second timeout
    );

    const cloudinaryUrl = await Promise.race([
      uploadPromise,
      uploadTimeoutPromise
    ]);

    console.log(
      `PDF uploaded to Cloudinary in ${
        Date.now() - uploadStartTime
      }ms for order ${orderId}`
    );
    console.log(`Cloudinary URL: ${cloudinaryUrl}`);
    console.log(
      `Total PDF process time: ${Date.now() - startTime}ms for order ${orderId}`
    );

    // Clean up the local PDF file after successful upload
    try {
      await fs.unlink(pdfResult.filepath);
      console.log(`Local PDF file cleaned up for order ${orderId}`);
    } catch (cleanupError) {
      console.error('Error deleting local PDF file:', cleanupError.message);
      // Don't throw error for cleanup failure, just log it
    }

    return cloudinaryUrl;
  } catch (error) {
    console.error(
      `PDF generation/upload failed for order ${orderId}:`,
      error.message
    );

    // If it's an upload error, try to keep the local file
    if (
      error.message.includes('Cloudinary') ||
      error.message.includes('upload')
    ) {
      console.log(
        `Cloudinary upload failed for order ${orderId}, keeping local file`
      );
      // You could implement a retry mechanism here or return local path as fallback
    }

    throw error;
  }
};

// Get order status and PDF URL
exports.getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user's company
    const company = await Company.findOne({ admin: req.user.id });
    if (!company || !order.companyId.equals(company._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let status = 'processing';
    let message = 'Invoice is being generated...';

    if (order.invoicepdf) {
      status = 'completed';
      message = 'Invoice ready';
    } else if (order.pdfError) {
      status = 'error';
      message = `PDF generation failed: ${order.pdfError}`;

      // Retry PDF generation if not too many attempts
      const attempts = order.pdfGenerationAttempts || 0;
      if (attempts < 3) {
        message += ' - Retrying...';

        // Trigger retry in background
        retryPDFGeneration(orderId).catch((err) =>
          console.error('Retry PDF generation failed:', err)
        );
      }
    }

    res.status(200).json({
      orderId: order._id,
      status,
      message,
      pdfUrl: order.invoicepdf || null,
      createdAt: order.createdat,
      grandTotal: order.grandtotal,
      attempts: order.pdfGenerationAttempts || 0
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    res.status(500).json({
      message: 'Error getting order status',
      error: error.message
    });
  }
};

// Retry PDF generation function
const retryPDFGeneration = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('customer');
    if (!order) return;

    const company = await Company.findById(order.companyId);
    if (!company) return;

    // Increment retry attempts
    await Order.findByIdAndUpdate(orderId, {
      $inc: { pdfGenerationAttempts: 1 },
      $unset: { pdfError: 1 }
    });

    // Get customer data
    let customerData;
    if (order.customer) {
      customerData = {
        name: order.customer.name,
        phone: order.customer.phone || '',
        address: order.customer.address || '',
        city: order.customer.city || '',
        state: order.customer.state || '',
        pincode: order.customer.pincode || ''
      };
    } else {
      customerData = order.customerInfo || {
        name: 'Walk-in Customer',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      };
    }

    // Recreate cart items from order data
    const cartItems = [];

    // Add products
    if (order.cartitems && order.cartitems.length > 0) {
      for (const item of order.cartitems) {
        const product = await Product.findById(item.productId);
        if (product) {
          cartItems.push({
            id: product._id,
            name: product.name,
            unitprice: product.price,
            quantity: item.quantity,
            total: item.quantity * product.price,
            type: 'product'
          });
        }
      }
    }

    // Add gift boxes
    if (order.giftboxes && order.giftboxes.length > 0) {
      for (const item of order.giftboxes) {
        const giftBox = await GiftBox.findById(item.giftBoxId);
        if (giftBox) {
          cartItems.push({
            id: giftBox._id,
            name: giftBox.name,
            unitprice: giftBox.grandtotal,
            quantity: item.quantity,
            total: item.quantity * giftBox.grandtotal,
            type: 'giftbox'
          });
        }
      }
    }

    const orderDetails = {
      cartitems: cartItems,
      discount: order.discount,
      total: order.total,
      grandtotal: order.grandtotal,
      gst: order.gst,
      createdat: order.createdat
    };

    const pdfParams = {
      companyDetails: company,
      customerDetails: customerData,
      orderDetails
    };

    const pdfUrl = await generateAndUploadPDF(
      pdfParams,
      company,
      customerData,
      orderId
    );

    await Order.findByIdAndUpdate(orderId, {
      invoicepdf: pdfUrl,
      $unset: { pdfError: 1 }
    });

    console.log(`PDF retry successful for order ${orderId}`);
    return pdfUrl;
  } catch (error) {
    console.error(`PDF retry failed for order ${orderId}:`, error.message);
    await Order.findByIdAndUpdate(orderId, {
      pdfError: error.message
    });
    throw error;
  }
};

// Manual PDF regeneration endpoint
exports.regeneratePDF = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user's company
    const company = await Company.findOne({ admin: req.user.id });
    if (!company || !order.companyId.equals(company._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Start PDF regeneration
    retryPDFGeneration(orderId)
      .then((pdfResult) => {
        console.log(
          `Manual PDF regeneration successful for order ${orderId}:`,
          pdfResult
        );
      })
      .catch((err) => {
        console.error(
          `Manual PDF regeneration failed for order ${orderId}:`,
          err.message
        );
      });

    res.status(200).json({
      message: 'PDF regeneration started',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error starting PDF regeneration:', error);
    res.status(500).json({
      message: 'Error starting PDF regeneration',
      error: error.message
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const previousYear = currentYear - 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear = currentMonth === 1 ? previousYear : currentYear;

    const totalRevenueCurrent = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      { $group: { _id: null, totalRevenue: { $sum: '$grandtotal' } } }
    ]);

    const totalRevenuePrevious = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: {
            $gte: new Date(`${previousYear}-01-01`),
            $lt: new Date(`${currentYear}-01-01`)
          }
        }
      },
      { $group: { _id: null, totalRevenue: { $sum: '$grandtotal' } } }
    ]);

    const revenueCurrent = totalRevenueCurrent[0]?.totalRevenue || 0;
    const revenuePrevious = totalRevenuePrevious[0]?.totalRevenue || 0;
    const revenueChange =
      revenuePrevious > 0
        ? ((revenueCurrent - revenuePrevious) / revenuePrevious) * 100
        : revenueCurrent > 0
        ? 100
        : 0;

    const totalInvoicesCurrent = await Order.countDocuments({
      companyId: company._id,
      createdat: {
        $gte: new Date(`${currentYear}-${currentMonth}-01`),
        $lt: new Date(
          currentMonth === 12
            ? `${currentYear + 1}-01-01`
            : `${currentYear}-${currentMonth + 1}-01`
        )
      }
    });

    const totalInvoicesPrevious = await Order.countDocuments({
      companyId: company._id,
      createdat: {
        $gte: new Date(`${previousMonthYear}-${previousMonth}-01`),
        $lt: new Date(
          previousMonth === 12
            ? `${previousMonthYear + 1}-01-01`
            : `${previousMonthYear}-${previousMonth + 1}-01`
        )
      }
    });

    const invoicesChange =
      totalInvoicesPrevious > 0
        ? ((totalInvoicesCurrent - totalInvoicesPrevious) /
            totalInvoicesPrevious) *
          100
        : totalInvoicesCurrent > 0
        ? 100
        : 0;

    const totalCustomersCurrent = await Customer.countDocuments({
      companyId: company._id,
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`)
      }
    });

    const totalCustomersPrevious = await Customer.countDocuments({
      companyId: company._id,
      createdAt: {
        $gte: new Date(`${previousYear}-01-01`),
        $lt: new Date(`${currentYear}-01-01`)
      }
    });

    const customersChange =
      totalCustomersPrevious > 0
        ? ((totalCustomersCurrent - totalCustomersPrevious) /
            totalCustomersPrevious) *
          100
        : totalCustomersCurrent > 0
        ? 100
        : 0;

    const yearlyMonthlyRevenue = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdat' } },
          revenue: { $sum: '$grandtotal' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const monthlyRevenueData = Array(12).fill(0);
    yearlyMonthlyRevenue.forEach(({ _id, revenue }) => {
      monthlyRevenueData[_id.month - 1] = revenue;
    });

    const currentMonthRevenue = monthlyRevenueData[currentMonth - 1] || 0;

    const previousMonthRevenueData = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: {
            $gte: new Date(`${previousMonthYear}-${previousMonth}-01`),
            $lt: new Date(
              previousMonth === 12
                ? `${previousMonthYear + 1}-01-01`
                : `${previousMonthYear}-${previousMonth + 1}-01`
            )
          }
        }
      },
      { $group: { _id: null, revenue: { $sum: '$grandtotal' } } }
    ]);

    const previousMonthRevenue = previousMonthRevenueData[0]?.revenue || 0;
    const monthRevenueChange =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : currentMonthRevenue > 0
        ? 100
        : 0;

    const top3Orders = await Order.find({ companyId: company._id })
      .sort({ createdat: -1 })
      .limit(3)
      .populate('customer', 'name')
      .select('_id createdat customer grandtotal invoicepdf');

    const formattedTop3Orders = top3Orders.map((order) => ({
      id: order._id,
      date: order.createdat,
      customerName: order.customer.name,
      amount: order.grandtotal,
      invoiceLink: order.invoicepdf
    }));

    const salesDistribution = await Order.aggregate([
      {
        $match: { companyId: company._id }
      },
      {
        $facet: {
          productRevenue: [
            { $unwind: '$cartitems' },
            {
              $lookup: {
                from: 'products',
                localField: 'cartitems.productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            { $unwind: '$product' },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ['$cartitems.quantity', '$product.price']
                  }
                }
              }
            }
          ],
          giftBoxRevenue: [
            { $unwind: '$giftboxes' },
            {
              $lookup: {
                from: 'giftboxes',
                localField: 'giftboxes.giftBoxId',
                foreignField: '_id',
                as: 'giftbox'
              }
            },
            { $unwind: '$giftbox' },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ['$giftboxes.quantity', '$giftbox.grandtotal']
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          productRevenue: { $arrayElemAt: ['$productRevenue.total', 0] },
          giftBoxRevenue: { $arrayElemAt: ['$giftBoxRevenue.total', 0] }
        }
      }
    ]);

    const productRevenue = salesDistribution[0]?.productRevenue || 0;
    const giftBoxRevenue = salesDistribution[0]?.giftBoxRevenue || 0;

    res.status(200).json({
      totalRevenue: revenueCurrent,
      totalRevenueChange: revenueChange.toFixed(2),
      totalInvoices: totalInvoicesCurrent,
      totalInvoicesChange: invoicesChange.toFixed(2),
      totalCustomers: totalCustomersCurrent,
      totalCustomersChange: customersChange.toFixed(2),
      currentMonthRevenue,
      currentMonthRevenueChange: monthRevenueChange.toFixed(2),
      topOrders: formattedTop3Orders,
      monthlyRevenue: monthlyRevenueData,
      salesDistribution: {
        productRevenue,
        giftBoxRevenue
      }
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const orders = await Order.find({ companyId: company._id })
      .populate('customer', 'name phone address')
      .sort({ createdat: -1 })
      .lean();

    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
};

exports.getOrdersByMonth = async (req, res) => {
  try {
    const { year } = req.body;

    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }

    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const ordersByMonth = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: {
            $gte: new Date(`${parseInt(year)}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`)
          }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      {
        $unwind: '$customerDetails'
      },
      {
        $project: {
          _id: 1,
          createdat: 1,
          grandtotal: 1,
          'customerDetails.name': 1,
          invoicepdf: 1,
          month: { $month: '$createdat' }
        }
      },
      {
        $group: {
          _id: '$month',
          orders: {
            $push: {
              id: '$_id',
              name: '$customerDetails.name',
              grandTotal: '$grandtotal',
              purchaseDate: '$createdat',
              invoiceLink: '$invoicepdf'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formattedResult = Array.from({ length: 12 }, (_, i) => {
      const monthData = ordersByMonth.find((m) => m._id === i + 1);
      return monthData ? monthData.orders : [];
    });

    res.status(200).json(formattedResult);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
};
