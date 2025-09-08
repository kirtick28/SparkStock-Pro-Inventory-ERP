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
  const session = await mongoose.startSession();
  session.startTransaction();

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
      return res
        .status(400)
        .json({
          message: 'Missing required fields: discount, total, grandtotal, gst'
        });
    }

    // Validate numeric values
    const discountNum = parseFloat(discount);
    const totalNum = parseFloat(total);
    const grandtotalNum = parseFloat(grandtotal);

    if (isNaN(discountNum) || isNaN(totalNum) || isNaN(grandtotalNum)) {
      return res
        .status(400)
        .json({
          message: 'Invalid numeric values for discount, total, or grandtotal'
        });
    }

    if (discountNum < 0 || totalNum < 0 || grandtotalNum < 0) {
      return res
        .status(400)
        .json({
          message: 'Discount, total, and grandtotal must be non-negative'
        });
    }

    const gstAmount = gst.amount ? parseFloat(gst.amount) : 0;
    if (gst.status && (isNaN(gstAmount) || gstAmount < 0)) {
      return res.status(400).json({ message: 'Invalid GST amount' });
    }

    // Get company details
    const company = await Company.findOne({ admin: req.user.id }).session(
      session
    );
    if (!company) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Company details not found' });
    }

    // Add company status check
    if (req.user.role !== 'superadmin' && !company.status) {
      await session.abortTransaction();
      return res.status(403).json({
        message: 'Company is not active. Please contact support.'
      });
    }

    let customer = null;
    let customerData = null;

    // Handle customer - either existing customer ID or new customer info
    if (id) {
      customer = await Customer.findById(id).session(session);
      if (!customer) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Customer not found' });
      }
      customerData = customer;
    } else if (customerInfo && customerInfo.name && customerInfo.name.trim()) {
      // Validate customer info
      customerData = {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone?.trim() || '',
        address: customerInfo.address?.trim() || '',
        city: customerInfo.city?.trim() || '',
        state: customerInfo.state?.trim() || '',
        pincode: customerInfo.pincode?.trim() || ''
      };
    } else {
      // Default walk-in customer
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
    const bulkProductUpdates = [];
    const bulkGiftBoxUpdates = [];

    // Process products with bulk operations
    if (products && Array.isArray(products) && products.length > 0) {
      for (const item of products) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity < 1) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Invalid product data: productId and quantity are required`
          });
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 1) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Invalid quantity for product: ${productId}`
          });
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({
            message: `Product not found: ${productId}`
          });
        }

        if (product.stockavailable < quantityNum) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Insufficient stock for product: ${product.name}. Available: ${product.stockavailable}, Requested: ${quantityNum}`
          });
        }

        const itemTotal = quantityNum * product.price;

        // Prepare bulk update
        bulkProductUpdates.push({
          updateOne: {
            filter: { _id: productId },
            update: {
              $inc: {
                stockavailable: -quantityNum,
                totalsales: quantityNum,
                totalrevenue: itemTotal
              }
            }
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

    // Process gift boxes with bulk operations
    if (giftboxes && Array.isArray(giftboxes) && giftboxes.length > 0) {
      for (const box of giftboxes) {
        const { giftBoxId, quantity } = box;

        if (!giftBoxId || !quantity || quantity < 1) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Invalid gift box data: giftBoxId and quantity are required`
          });
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 1) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Invalid quantity for gift box: ${giftBoxId}`
          });
        }

        const giftBox = await GiftBox.findById(giftBoxId).session(session);
        if (!giftBox) {
          await session.abortTransaction();
          return res.status(404).json({
            message: `GiftBox not found: ${giftBoxId}`
          });
        }

        if (giftBox.stockavailable < quantityNum) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Insufficient stock for gift box: ${giftBox.name}. Available: ${giftBox.stockavailable}, Requested: ${quantityNum}`
          });
        }

        const boxTotal = quantityNum * giftBox.grandtotal;

        // Prepare bulk update
        bulkGiftBoxUpdates.push({
          updateOne: {
            filter: { _id: giftBoxId },
            update: {
              $inc: {
                stockavailable: -quantityNum,
                totalsales: quantityNum,
                totalrevenue: boxTotal
              }
            }
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

    // Execute bulk updates
    if (bulkProductUpdates.length > 0) {
      await Product.bulkWrite(bulkProductUpdates, { session });
    }
    if (bulkGiftBoxUpdates.length > 0) {
      await GiftBox.bulkWrite(bulkGiftBoxUpdates, { session });
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

    const savedOrder = await order.save({ session });

    // Update customer orders if it's a registered customer
    if (customer) {
      await Customer.findByIdAndUpdate(
        customer._id,
        { $push: { orders: { id: savedOrder._id } } },
        { session }
      );
    }

    // Commit transaction before PDF generation
    await session.commitTransaction();

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

    // Delete cart if it's for an existing customer
    if (id) {
      Cart.deleteOne({ id }).catch((err) =>
        console.error('Error deleting cart:', err)
      );
    }

    // Start PDF generation but don't wait for it
    pdfPromise
      .then((pdfUrl) => {
        // PDF generated successfully, update order with URL
        Order.findByIdAndUpdate(savedOrder._id, { invoicepdf: pdfUrl }).catch(
          (err) => console.error('Error updating order with PDF URL:', err)
        );
      })
      .catch((err) => {
        console.error('PDF generation failed:', err);
      });

    res.status(200).json({
      message: 'Order placed successfully. Invoice is being generated.',
      orderId: savedOrder._id,
      pdfUrl: null // Will be available shortly
    });
  } catch (error) {
    console.error('Error placing order:', error);
    await session.abortTransaction();
    res.status(500).json({
      message: 'Error placing order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Separate function for PDF generation and upload
const generateAndUploadPDF = async (
  pdfParams,
  company,
  customerData,
  orderId
) => {
  try {
    await generatePDF(pdfParams);
    const url = await uploadPDFToCloudinary(
      './invoice.pdf',
      company.companyname,
      customerData.name
    );

    // Clean up the temporary PDF file
    await fs
      .unlink('./invoice.pdf')
      .catch((err) => console.error('Error deleting invoice.pdf:', err));

    return url;
  } catch (error) {
    console.error('PDF generation/upload error:', error);
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

    res.status(200).json({
      orderId: order._id,
      status: order.invoicepdf ? 'completed' : 'processing',
      pdfUrl: order.invoicepdf || null,
      createdAt: order.createdat,
      grandTotal: order.grandtotal
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    res.status(500).json({
      message: 'Error getting order status',
      error: error.message
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.user.companyId });
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
