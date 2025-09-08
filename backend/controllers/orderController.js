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
    const { id, products, giftboxes, discount, total, grandtotal, gst } =
      req.body;
    if (
      !id ||
      !products ||
      !Array.isArray(products) ||
      !discount ||
      !total ||
      !grandtotal ||
      !gst
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const gstAmount = gst.amount ? parseFloat(gst.amount) : null;
    if (gst.status && (isNaN(gstAmount) || gstAmount < 0)) {
      return res.status(400).json({ message: 'Invalid GST amount' });
    }

    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company details not found' });
    }
    // Add company status check
    if (req.user.role !== 'superadmin' && !company.status) {
      return res
        .status(403)
        .json({ message: 'Company is not active. Please contact support.' });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const cartItems = [];

    for (const item of products) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity < 1) {
        return res
          .status(400)
          .json({ message: `Invalid product data: ${JSON.stringify(item)}` });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${productId}` });
      }

      if (product.stockavailable < quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product: ${product.name}` });
      }

      const itemTotal = quantity * product.price;
      product.stockavailable -= quantity;
      product.totalsales += quantity;
      product.totalrevenue += itemTotal;
      await product.save();

      cartItems.push({
        id: product._id,
        name: product.name,
        unitprice: product.price,
        quantity: quantity,
        total: itemTotal,
        type: 'product'
      });
    }

    if (giftboxes && Array.isArray(giftboxes)) {
      for (const box of giftboxes) {
        const { giftBoxId, quantity } = box;
        if (!giftBoxId || !quantity || quantity < 1) {
          return res
            .status(400)
            .json({ message: `Invalid gift box data: ${JSON.stringify(box)}` });
        }

        const giftBox = await GiftBox.findById(giftBoxId);
        if (!giftBox) {
          return res
            .status(404)
            .json({ message: `GiftBox not found: ${giftBoxId}` });
        }

        if (giftBox.stockavailable < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for gift box: ${giftBox.name}`
          });
        }

        const boxTotal = quantity * giftBox.grandtotal;
        giftBox.stockavailable -= quantity;
        giftBox.totalsales += quantity;
        giftBox.totalrevenue += boxTotal;
        await giftBox.save();

        cartItems.push({
          id: giftBox._id,
          name: giftBox.name,
          unitprice: giftBox.grandtotal,
          quantity: quantity,
          total: boxTotal,
          type: 'giftbox'
        });
      }
    }

    const order = new Order({
      companyId: company._id,
      customer: customer._id,
      cartitems: products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      giftboxes: giftboxes
        ? giftboxes.map((box) => ({
            giftBoxId: box.giftBoxId,
            quantity: box.quantity
          }))
        : [],
      discount,
      total,
      grandtotal,
      gst: {
        status: gst.status,
        percentage: gst.status ? gst.percentage : null,
        amount: gst.status ? gstAmount : null
      }
    });

    const savedOrder = await order.save();

    customer.orders.push({ id: savedOrder._id });
    await customer.save();

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
      customerDetails: customer,
      orderDetails
    };

    try {
      await generatePDF(pdfParams);
      const url = await uploadPDFToCloudinary(
        './invoice.pdf',
        company.companyname,
        customer.name
      );

      savedOrder.invoicepdf = url;
      await savedOrder.save();

      await fs
        .unlink('./invoice.pdf')
        .catch((err) => console.error('Error deleting invoice.pdf:', err));

      await Cart.deleteOne({ id });

      res.status(200).json({
        message: 'Order placed successfully and PDF generated',
        invoiceurl: savedOrder.invoicepdf
      });
    } catch (error) {
      console.error('PDF Error:', error);
      return res.status(500).json({
        message: 'Failed to generate or upload the invoice PDF',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error placing order:', error);
    res
      .status(500)
      .json({ message: 'Error placing order', error: error.message });
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
