const {
  Order,
  Customer,
  Product,
  Company,
  GiftBox
} = require('../utils/modelUtil');
const mongoose = require('mongoose');

// Advanced Analytics Controller
exports.getAdvancedAnalytics = async (req, res) => {
  try {
    console.log('Analytics request received:', req.query);
    console.log('User info:', { id: req.user.id, role: req.user.role });

    const { startDate, endDate, timeRange = '12months' } = req.query;

    const company = await Company.findOne({ admin: req.user.id });
    console.log('Company found:', company ? company._id : 'No company');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const currentDate = new Date();
    let dateFilter = {};

    // Set date range based on query params or default
    if (startDate && endDate) {
      dateFilter = {
        createdat: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const monthsBack =
        timeRange === '6months' ? 6 : timeRange === '3months' ? 3 : 12;
      const startOfPeriod = new Date();
      startOfPeriod.setMonth(startOfPeriod.getMonth() - monthsBack);

      dateFilter = {
        createdat: {
          $gte: startOfPeriod,
          $lte: currentDate
        }
      };
    }

    // Revenue analytics by different time periods
    const revenueAnalytics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdat' },
            month: { $month: '$createdat' },
            day: { $dayOfMonth: '$createdat' },
            week: { $week: '$createdat' }
          },
          revenue: { $sum: '$grandtotal' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$grandtotal' },
          totalDiscount: { $sum: '$discount' },
          totalGST: { $sum: '$gst.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Product performance analytics
    const productAnalytics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          ...dateFilter
        }
      },
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
          _id: '$product._id',
          productName: { $first: '$product.name' },
          productPrice: { $first: '$product.price' },
          totalQuantitySold: { $sum: '$cartitems.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$cartitems.quantity', '$product.price'] }
          },
          orderCount: { $sum: 1 },
          avgQuantityPerOrder: { $avg: '$cartitems.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Customer analytics
    const customerAnalytics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          customer: { $ne: null },
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $group: {
          _id: '$customer',
          customerName: { $first: '$customerInfo.name' },
          customerPhone: { $first: '$customerInfo.phone' },
          customerCity: { $first: '$customerInfo.city' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$grandtotal' },
          avgOrderValue: { $avg: '$grandtotal' },
          firstOrderDate: { $min: '$createdat' },
          lastOrderDate: { $max: '$createdat' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Gift box analytics
    const giftBoxAnalytics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          giftboxes: { $exists: true, $ne: [] },
          ...dateFilter
        }
      },
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
          _id: '$giftbox._id',
          giftBoxName: { $first: '$giftbox.name' },
          giftBoxPrice: { $first: '$giftbox.grandtotal' },
          totalQuantitySold: { $sum: '$giftboxes.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$giftboxes.quantity', '$giftbox.grandtotal'] }
          },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Inventory analytics
    const inventoryAnalytics = await Product.aggregate([
      {
        $match: { companyId: company._id }
      },
      {
        $addFields: {
          stockStatus: {
            $cond: {
              if: { $lte: ['$stockavailable', 10] },
              then: 'Low Stock',
              else: {
                $cond: {
                  if: { $lte: ['$stockavailable', 50] },
                  then: 'Medium Stock',
                  else: 'High Stock'
                }
              }
            }
          },
          totalValue: { $multiply: ['$stockavailable', '$price'] }
        }
      },
      {
        $group: {
          _id: null,
          products: { $push: '$$ROOT' },
          totalProducts: { $sum: 1 },
          totalInventoryValue: { $sum: '$totalValue' },
          lowStockProducts: {
            $sum: {
              $cond: [{ $lte: ['$stockavailable', 10] }, 1, 0]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [{ $eq: ['$stockavailable', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Sales trend analytics (hourly, daily, weekly, monthly)
    const salesTrends = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdat' },
            dayOfWeek: { $dayOfWeek: '$createdat' },
            dayOfMonth: { $dayOfMonth: '$createdat' },
            month: { $month: '$createdat' },
            year: { $year: '$createdat' }
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$grandtotal' }
        }
      }
    ]);

    // Geographic analytics (by city/state)
    const geographicAnalytics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          ...dateFilter,
          $or: [
            { 'customerInfo.city': { $ne: null } },
            { customer: { $ne: null } }
          ]
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerData'
        }
      },
      {
        $addFields: {
          city: {
            $cond: {
              if: { $ne: ['$customerInfo.city', null] },
              then: '$customerInfo.city',
              else: { $arrayElemAt: ['$customerData.city', 0] }
            }
          },
          state: {
            $cond: {
              if: { $ne: ['$customerInfo.state', null] },
              then: '$customerInfo.state',
              else: { $arrayElemAt: ['$customerData.state', 0] }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            city: '$city',
            state: '$state'
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$grandtotal' },
          customers: { $addToSet: '$customer' }
        }
      },
      {
        $addFields: {
          uniqueCustomers: { $size: '$customers' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Payment method analytics (if GST data indicates payment type)
    const paymentAnalytics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$gst.status',
          orderCount: { $sum: 1 },
          revenue: { $sum: '$grandtotal' },
          avgOrderValue: { $avg: '$grandtotal' }
        }
      }
    ]);

    // Growth analytics (comparing periods)
    const growthAnalytics = await Order.aggregate([
      {
        $match: { companyId: company._id }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdat' },
            month: { $month: '$createdat' }
          },
          revenue: { $sum: '$grandtotal' },
          orders: { $sum: 1 },
          customers: { $addToSet: '$customer' }
        }
      },
      {
        $addFields: {
          uniqueCustomers: { $size: '$customers' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        revenueAnalytics,
        productAnalytics,
        customerAnalytics,
        giftBoxAnalytics,
        inventoryAnalytics: inventoryAnalytics[0] || {
          products: [],
          totalProducts: 0,
          totalInventoryValue: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0
        },
        salesTrends,
        geographicAnalytics,
        paymentAnalytics,
        growthAnalytics,
        dateRange: {
          start: dateFilter.createdat?.$gte || 'All time',
          end: dateFilter.createdat?.$lte || 'Present'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

// Export specific data for downloads
exports.exportAnalyticsData = async (req, res) => {
  try {
    const { type, format = 'json', startDate, endDate } = req.query;

    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdat: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let data = {};

    switch (type) {
      case 'orders':
        data = await Order.find({
          companyId: company._id,
          ...dateFilter
        })
          .populate('customer', 'name phone city state')
          .populate('cartitems.productId', 'name price')
          .populate('giftboxes.giftBoxId', 'name grandtotal')
          .lean();
        break;

      case 'products':
        data = await Product.find({ companyId: company._id }).lean();
        break;

      case 'customers':
        data = await Customer.find({ companyId: company._id }).lean();
        break;

      case 'revenue':
        data = await Order.aggregate([
          {
            $match: {
              companyId: company._id,
              ...dateFilter
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdat' },
                month: { $month: '$createdat' },
                day: { $dayOfMonth: '$createdat' }
              },
              revenue: { $sum: '$grandtotal' },
              orders: { $sum: 1 },
              avgOrderValue: { $avg: '$grandtotal' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        break;

      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    res.json({
      success: true,
      data,
      exportInfo: {
        type,
        format,
        timestamp: new Date(),
        recordCount: Array.isArray(data) ? data.length : 1
      }
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

// Real-time dashboard metrics
exports.getRealTimeDashboard = async (req, res) => {
  try {
    const company = await Company.findOne({ admin: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's metrics
    const todayMetrics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandtotal' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$grandtotal' }
        }
      }
    ]);

    // This week's metrics
    const weekMetrics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandtotal' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // This month's metrics
    const monthMetrics = await Order.aggregate([
      {
        $match: {
          companyId: company._id,
          createdat: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandtotal' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Low stock alerts
    const lowStockProducts = await Product.find({
      companyId: company._id,
      stockavailable: { $lte: 10 }
    }).lean();

    // Recent orders
    const recentOrders = await Order.find({
      companyId: company._id
    })
      .sort({ createdat: -1 })
      .limit(10)
      .populate('customer', 'name')
      .lean();

    res.json({
      success: true,
      data: {
        today: todayMetrics[0] || { revenue: 0, orders: 0, avgOrderValue: 0 },
        week: weekMetrics[0] || { revenue: 0, orders: 0 },
        month: monthMetrics[0] || { revenue: 0, orders: 0 },
        lowStockProducts,
        recentOrders,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching real-time dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time data',
      error: error.message
    });
  }
};
