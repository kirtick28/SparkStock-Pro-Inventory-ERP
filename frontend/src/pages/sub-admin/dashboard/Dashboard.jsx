import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  FileText,
  Globe,
  Clock,
  AlertTriangle,
  Star,
  Target,
  Eye,
  EyeOff,
  ChevronDown,
  Search
} from 'lucide-react';
import axios from 'axios';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  AdvancedChart,
  MetricCard,
  DataTable
} from '../../../components/analytics/AdvancedCharts';
import {
  exportToExcel,
  exportToCSV,
  exportChartAsImage,
  exportDashboardAsPDF,
  exportComprehensiveReport,
  formatDataForExport
} from '../../../utils/exportUtils';
import Loader from '../../../components/common/Loader';
import { toast } from 'react-toastify';

const Dashboard = ({ userName }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('12months');
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: '',
    end: ''
  });
  const [activeCharts, setActiveCharts] = useState({
    revenue: true,
    products: true,
    customers: true,
    giftboxes: true,
    inventory: true,
    trends: true
  });
  const [chartTypes, setChartTypes] = useState({
    revenue: 'line',
    products: 'bar',
    customers: 'bar',
    giftboxes: 'pie',
    trends: 'area'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      console.log('Fetching analytics data...');

      const params = {
        timeRange: selectedTimeRange,
        ...(selectedDateRange.start &&
          selectedDateRange.end && {
            startDate: selectedDateRange.start,
            endDate: selectedDateRange.end
          })
      };

      console.log('Request params:', params);

      const [analyticsResponse, realtimeResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASEURL}/analytics/advanced`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        }),
        axios.get(`${import.meta.env.VITE_BASEURL}/analytics/realtime`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Analytics response:', analyticsResponse.status);
      console.log('Realtime response:', realtimeResponse.status);

      if (analyticsResponse.status === 200) {
        setAnalyticsData(analyticsResponse.data.data);
        console.log('Analytics data loaded successfully');
      }

      if (realtimeResponse.status === 200) {
        setRealtimeData(realtimeResponse.data.data);
        console.log('Realtime data loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      console.error('Error details:', error.response?.data || error.message);

      // Fallback: try to fetch basic dashboard data if analytics fails
      try {
        console.log('Attempting fallback to basic dashboard...');
        const fallbackResponse = await axios.get(
          `${import.meta.env.VITE_BASEURL}/order/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (fallbackResponse.status === 200) {
          console.log('Fallback data loaded:', fallbackResponse.data);
          toast.info(
            'Using basic dashboard data (advanced analytics unavailable)'
          );

          // Convert old dashboard data to new format
          const oldData = fallbackResponse.data;
          setAnalyticsData({
            revenueAnalytics: oldData.monthlyRevenue
              ? oldData.monthlyRevenue.map((revenue, index) => ({
                  _id: {
                    year: new Date().getFullYear(),
                    month: index + 1,
                    day: 1
                  },
                  revenue: revenue || 0,
                  orders: 0,
                  avgOrderValue: 0
                }))
              : [],
            productAnalytics: [],
            customerAnalytics: [],
            giftBoxAnalytics: [],
            inventoryAnalytics: {
              totalProducts: 0,
              totalInventoryValue: 0,
              lowStockProducts: 0,
              outOfStockProducts: 0
            },
            salesTrends: []
          });

          setRealtimeData({
            today: {
              revenue: oldData.currentMonthRevenue || 0,
              orders: oldData.totalInvoices || 0
            },
            week: {
              revenue: oldData.currentMonthRevenue || 0,
              orders: oldData.totalInvoices || 0
            },
            month: {
              revenue: oldData.currentMonthRevenue || 0,
              orders: oldData.totalInvoices || 0
            },
            lowStockProducts: []
          });
        }
      } catch (fallbackError) {
        console.error('Fallback dashboard fetch failed:', fallbackError);
        toast.error('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, selectedDateRange]);

  // Auto-refresh functionality
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchAnalyticsData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchAnalyticsData]);

  // Chart data preparation functions
  const prepareRevenueData = () => {
    if (!analyticsData?.revenueAnalytics) return [];
    return analyticsData.revenueAnalytics.map((item) => ({
      date: `${item._id.year}-${item._id.month}-${item._id.day || 1}`,
      revenue: item.revenue || 0,
      orders: item.orders || 0,
      avgOrderValue: item.avgOrderValue || 0,
      discount: item.totalDiscount || 0,
      gst: item.totalGST || 0
    }));
  };

  const prepareProductData = () => {
    if (!analyticsData?.productAnalytics) return [];
    return analyticsData.productAnalytics.slice(0, 10).map((item) => ({
      name:
        item.productName?.substring(0, 15) +
        (item.productName?.length > 15 ? '...' : ''),
      revenue: item.totalRevenue || 0,
      quantity: item.totalQuantitySold || 0,
      orders: item.orderCount || 0,
      fullName: item.productName
    }));
  };

  const prepareCustomerData = () => {
    if (!analyticsData?.customerAnalytics) return [];
    return analyticsData.customerAnalytics.slice(0, 10).map((item) => ({
      name:
        item.customerName?.substring(0, 15) +
        (item.customerName?.length > 15 ? '...' : ''),
      totalSpent: item.totalSpent || 0,
      orders: item.totalOrders || 0,
      avgOrder: item.avgOrderValue || 0,
      fullName: item.customerName
    }));
  };

  const prepareGiftBoxData = () => {
    if (!analyticsData?.giftBoxAnalytics) return [];
    return analyticsData.giftBoxAnalytics.map((item) => ({
      name: item.giftBoxName,
      revenue: item.totalRevenue || 0,
      quantity: item.totalQuantitySold || 0
    }));
  };

  const prepareTrendsData = () => {
    if (!analyticsData?.salesTrends) return [];
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourData = analyticsData.salesTrends.filter(
        (item) => item._id.hour === hour
      );
      return {
        hour: `${hour}:00`,
        orders: hourData.reduce((sum, item) => sum + item.orderCount, 0),
        revenue: hourData.reduce((sum, item) => sum + item.revenue, 0)
      };
    });
    return hourlyData;
  };

  // Export functions
  const handleExport = async (type, format) => {
    try {
      let success = false;
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');

      switch (format) {
        case 'excel':
          if (type === 'comprehensive') {
            success = await exportComprehensiveReport(
              analyticsData,
              `analytics_comprehensive_${timestamp}`
            );
          } else {
            const data = formatDataForExport(analyticsData[type], type);
            success = exportToExcel(
              data,
              `analytics_${type}_${timestamp}`,
              type
            );
          }
          break;

        case 'csv':
          const data = formatDataForExport(analyticsData[type], type);
          success = exportToCSV(data, `analytics_${type}_${timestamp}`);
          break;

        case 'pdf':
          const chartIds = Object.keys(activeCharts)
            .filter((key) => activeCharts[key])
            .map((key) => `chart-${key}`);
          success = await exportDashboardAsPDF(
            chartIds,
            `dashboard_${timestamp}`
          );
          break;

        case 'image':
          success = await exportChartAsImage(
            `chart-${type}`,
            `chart_${type}_${timestamp}`
          );
          break;
      }

      if (success) {
        toast.success(
          `Successfully exported ${type} as ${format.toUpperCase()}`
        );
      } else {
        toast.error(`Failed to export ${type}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  // Time range presets
  const timeRangeOptions = [
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '12months', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Chart type options
  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'composed', label: 'Combined Chart', icon: BarChart3 }
  ];

  if (loading && !analyticsData) {
    return (
      <div
        className={`min-h-screen p-6 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        } flex justify-center items-center`}
      >
        <Loader size={60} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-gray-900 text-gray-100'
          : 'bg-gray-100 text-gray-800'
      } p-4 md:p-6`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1
            className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            Advanced Analytics Dashboard
          </h1>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Welcome back,{' '}
            <span className="text-blue-600 font-semibold">{userName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Date Range */}
          {selectedTimeRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) =>
                  setSelectedDateRange((prev) => ({
                    ...prev,
                    start: e.target.value
                  }))
                }
                className={`px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <span>to</span>
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) =>
                  setSelectedDateRange((prev) => ({
                    ...prev,
                    end: e.target.value
                  }))
                }
                className={`px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-100'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            } bg-blue-500 text-white`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Menu */}
          <div className="relative group">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
              }`}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={14} />
            </button>

            <div
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-2">
                <button
                  onClick={() => handleExport('comprehensive', 'excel')}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                >
                  <FileSpreadsheet size={16} />
                  Complete Report (Excel)
                </button>
                <button
                  onClick={() => handleExport('revenue', 'pdf')}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                >
                  <FileText size={16} />
                  Dashboard (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Auto Refresh
                </label>
                <select
                  value={refreshInterval || ''}
                  onChange={(e) =>
                    setRefreshInterval(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Manual</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Visible Charts
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(activeCharts).map((chart) => (
                    <button
                      key={chart}
                      onClick={() =>
                        setActiveCharts((prev) => ({
                          ...prev,
                          [chart]: !prev[chart]
                        }))
                      }
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        activeCharts[chart]
                          ? 'bg-blue-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {chart}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Metrics */}
      {realtimeData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Today's Revenue"
            value={`₹${realtimeData.today?.revenue?.toLocaleString() || 0}`}
            icon={<DollarSign size={24} />}
            color="green"
            subtext={`${realtimeData.today?.orders || 0} orders`}
          />
          <MetricCard
            title="This Week"
            value={`₹${realtimeData.week?.revenue?.toLocaleString() || 0}`}
            icon={<TrendingUp size={24} />}
            color="blue"
            subtext={`${realtimeData.week?.orders || 0} orders`}
          />
          <MetricCard
            title="This Month"
            value={`₹${realtimeData.month?.revenue?.toLocaleString() || 0}`}
            icon={<Target size={24} />}
            color="purple"
            subtext={`${realtimeData.month?.orders || 0} orders`}
          />
          <MetricCard
            title="Low Stock Alert"
            value={realtimeData.lowStockProducts?.length || 0}
            icon={<AlertTriangle size={24} />}
            color={realtimeData.lowStockProducts?.length > 0 ? 'red' : 'green'}
            subtext="Products need restock"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Revenue Analytics */}
        {activeCharts.revenue && (
          <div id="chart-revenue" className="lg:col-span-2">
            {prepareRevenueData().length > 0 ? (
              <AdvancedChart
                data={prepareRevenueData()}
                chartType={chartTypes.revenue}
                title="Revenue Analytics"
                xKey="date"
                yKeys={['revenue', 'orders']}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-8 shadow-lg text-center`}
              >
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Revenue Data</h3>
                <p className="text-gray-500">
                  Revenue analytics will appear when you have orders
                </p>
              </div>
            )}
          </div>
        )}

        {/* Product Performance */}
        {activeCharts.products && (
          <div id="chart-products">
            {prepareProductData().length > 0 ? (
              <AdvancedChart
                data={prepareProductData()}
                chartType={chartTypes.products}
                title="Top Products by Revenue"
                xKey="name"
                yKeys={['revenue', 'quantity']}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-8 shadow-lg text-center`}
              >
                <Package size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Product Data</h3>
                <p className="text-gray-500">
                  Product analytics will appear when you have sales
                </p>
              </div>
            )}
          </div>
        )}

        {/* Customer Analytics */}
        {activeCharts.customers && (
          <div id="chart-customers">
            {prepareCustomerData().length > 0 ? (
              <AdvancedChart
                data={prepareCustomerData()}
                chartType={chartTypes.customers}
                title="Top Customers by Spending"
                xKey="name"
                yKeys={['totalSpent', 'orders']}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-8 shadow-lg text-center`}
              >
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Customer Data</h3>
                <p className="text-gray-500">
                  Customer analytics will appear when you have customers
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gift Box Performance */}
        {activeCharts.giftboxes && (
          <div id="chart-giftboxes">
            {analyticsData?.giftBoxAnalytics?.length > 0 ? (
              <AdvancedChart
                data={prepareGiftBoxData()}
                chartType={chartTypes.giftboxes}
                title="Gift Box Performance"
                xKey="name"
                yKeys={['revenue', 'quantity']}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-8 shadow-lg text-center`}
              >
                <ShoppingCart
                  size={48}
                  className="mx-auto mb-4 text-gray-400"
                />
                <h3 className="text-lg font-semibold mb-2">No Gift Box Data</h3>
                <p className="text-gray-500">
                  Gift box analytics will appear when you have gift box sales
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sales Trends */}
        {activeCharts.trends && (
          <div id="chart-trends">
            {prepareTrendsData().some(
              (item) => item.orders > 0 || item.revenue > 0
            ) ? (
              <AdvancedChart
                data={prepareTrendsData()}
                chartType={chartTypes.trends}
                title="Sales Trends by Hour"
                xKey="hour"
                yKeys={['orders', 'revenue']}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-8 shadow-lg text-center`}
              >
                <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Trends Data</h3>
                <p className="text-gray-500">
                  Sales trend analytics will appear when you have orders
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inventory Overview */}
      {analyticsData?.inventoryAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Inventory Value"
            value={`₹${
              analyticsData.inventoryAnalytics.totalInventoryValue?.toLocaleString() ||
              0
            }`}
            icon={<Package size={24} />}
            color="blue"
          />
          <MetricCard
            title="Total Products"
            value={analyticsData.inventoryAnalytics.totalProducts || 0}
            icon={<ShoppingCart size={24} />}
            color="green"
          />
          <MetricCard
            title="Out of Stock"
            value={analyticsData.inventoryAnalytics.outOfStockProducts || 0}
            icon={<AlertTriangle size={24} />}
            color="red"
          />
        </div>
      )}

      {/* Data Tables */}
      <div className="space-y-6">
        {/* Product Performance Table */}
        {analyticsData?.productAnalytics?.length > 0 && (
          <DataTable
            title="Product Performance Details"
            data={analyticsData.productAnalytics}
            columns={[
              { key: 'productName', label: 'Product Name' },
              {
                key: 'productPrice',
                label: 'Price',
                render: (value) => `₹${value}`
              },
              { key: 'totalQuantitySold', label: 'Qty Sold' },
              {
                key: 'totalRevenue',
                label: 'Revenue',
                render: (value) => `₹${value?.toLocaleString()}`
              },
              { key: 'orderCount', label: 'Orders' },
              {
                key: 'avgQuantityPerOrder',
                label: 'Avg Qty/Order',
                render: (value) => value?.toFixed(1)
              }
            ]}
            searchable={true}
            exportable={true}
          />
        )}

        {/* Customer Analytics Table */}
        {analyticsData?.customerAnalytics?.length > 0 && (
          <DataTable
            title="Customer Analytics Details"
            data={analyticsData.customerAnalytics}
            columns={[
              { key: 'customerName', label: 'Customer Name' },
              { key: 'customerPhone', label: 'Phone' },
              { key: 'totalOrders', label: 'Total Orders' },
              {
                key: 'totalSpent',
                label: 'Total Spent',
                render: (value) => `₹${value?.toLocaleString()}`
              },
              {
                key: 'avgOrderValue',
                label: 'Avg Order',
                render: (value) => `₹${value?.toLocaleString()}`
              }
            ]}
            searchable={true}
            exportable={true}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
