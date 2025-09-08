import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  User,
  Package,
  DollarSign,
  Phone,
  MapPin,
  Calendar,
  Download,
  Eye,
  SortAsc,
  SortDesc,
  RefreshCw,
  TrendingUp,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../../contexts/ThemeContext';
import Loader from '../../../components/common/Loader';

const PurchaseHistory = () => {
  const { theme } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, with-customer, without-customer
  const [sortBy, setSortBy] = useState('date'); // date, amount, customer
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch all invoices from API
  const fetchInvoices = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/order/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices. Please try again.', {
        autoClose: 3000,
        theme: theme === 'dark' ? 'dark' : 'light'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter and sort invoices
  const filteredAndSortedInvoices = React.useMemo(() => {
    let filtered = [...invoices];

    // Text search (customer name, phone, or invoice details)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((invoice) => {
        const customerName = invoice.customer?.name?.toLowerCase() || '';
        const customerPhone = invoice.customer?.phone?.toLowerCase() || '';
        const invoiceId = invoice._id?.toLowerCase() || '';
        const amount = invoice.grandtotal?.toString() || '';

        return (
          customerName.includes(search) ||
          customerPhone.includes(search) ||
          invoiceId.includes(search) ||
          amount.includes(search) ||
          (invoice.products &&
            invoice.products.some((product) =>
              product.name?.toLowerCase().includes(search)
            ))
        );
      });
    }

    // Filter by customer type
    if (filterType === 'with-customer') {
      filtered = filtered.filter((invoice) => invoice.customer);
    } else if (filterType === 'without-customer') {
      filtered = filtered.filter((invoice) => !invoice.customer);
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(
        (invoice) => new Date(invoice.createdat) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (invoice) =>
          new Date(invoice.createdat) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // Filter by amount range
    if (amountRange.min) {
      filtered = filtered.filter(
        (invoice) => invoice.grandtotal >= parseFloat(amountRange.min)
      );
    }
    if (amountRange.max) {
      filtered = filtered.filter(
        (invoice) => invoice.grandtotal <= parseFloat(amountRange.max)
      );
    }

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdat);
          bValue = new Date(b.createdat);
          break;
        case 'amount':
          aValue = a.grandtotal;
          bValue = b.grandtotal;
          break;
        case 'customer':
          aValue = a.customer?.name || 'Walk-in Customer';
          bValue = b.customer?.name || 'Walk-in Customer';
          break;
        default:
          aValue = new Date(a.createdat);
          bValue = new Date(b.createdat);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    invoices,
    searchTerm,
    filterType,
    sortBy,
    sortOrder,
    dateRange,
    amountRange
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate stats
  const stats = [
    {
      title: 'Total Invoices',
      value: invoices.length,
      icon: FileText,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'With Customer',
      value: invoices.filter((inv) => inv.customer).length,
      icon: User,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Walk-in Sales',
      value: invoices.filter((inv) => !inv.customer).length,
      icon: Package,
      color: 'orange',
      change: '+15%'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(
        invoices.reduce((sum, inv) => sum + inv.grandtotal, 0)
      ),
      icon: DollarSign,
      color: 'purple',
      change: '+18%'
    }
  ];

  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-3 md:p-6 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            } backdrop-blur-sm rounded-xl border p-3 md:p-4 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs md:text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-lg md:text-xl font-bold mt-1 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
                <span
                  className={`text-xs font-medium ${
                    stat.change.startsWith('+')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change} from last month
                </span>
              </div>
              <div
                className={`p-2 md:p-3 rounded-xl ${
                  stat.color === 'blue'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : stat.color === 'green'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : stat.color === 'orange'
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                }`}
              >
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white/70 border-gray-200'
        } backdrop-blur-sm rounded-xl border p-3 md:p-4 mb-4 md:mb-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0 relative">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search invoices by customer, phone, ID, amount, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Desktop Filters and Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Customer Type Filter */}
            <div className="flex items-center gap-2">
              <Filter
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="all">All Invoices</option>
                <option value="with-customer">With Customer</option>
                <option value="without-customer">Walk-in Sales</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <TrendingUp
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="customer">Customer</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title={`Sort ${
                  sortOrder === 'asc' ? 'Ascending' : 'Descending'
                }`}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc size={16} />
                ) : (
                  <SortDesc size={16} />
                )}
              </motion.button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300 dark:border-gray-600">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchInvoices}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
                title="Refresh Data"
              >
                <RefreshCw size={16} className="inline mr-1.5" />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                } ${showMobileFilters ? 'ring-2 ring-blue-500/20' : ''}`}
              >
                <Filter size={16} className="inline mr-1.5" />
                Filters
              </motion.button>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchInvoices}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Expanded Filters */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 md:hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    Customer Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Invoices</option>
                    <option value="with-customer">With Customer</option>
                    <option value="without-customer">Walk-in Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    Min Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={amountRange.min}
                    onChange={(e) =>
                      setAmountRange({ ...amountRange, min: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    Max Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="999999"
                    value={amountRange.max}
                    onChange={(e) =>
                      setAmountRange({ ...amountRange, max: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Summary */}
      <div className="mb-4">
        <p
          className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Showing {filteredAndSortedInvoices.length} of {invoices.length}{' '}
          invoices
        </p>
      </div>

      {/* Invoice Cards */}
      {filteredAndSortedInvoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-12 ${
            theme === 'dark'
              ? 'bg-gray-700/30 border-gray-600'
              : 'bg-gray-50 border-gray-300'
          } rounded-xl border border-dashed mt-6`}
        >
          <FileText
            size={48}
            className={`mx-auto mb-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}
          />
          <p
            className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            No invoices found
          </p>
          <p
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {searchTerm ||
            filterType !== 'all' ||
            dateRange.start ||
            dateRange.end ||
            amountRange.min ||
            amountRange.max
              ? "Try adjusting your search criteria or filters to find what you're looking for."
              : 'No purchase history available.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {filteredAndSortedInvoices.map((invoice, index) => (
              <motion.div
                key={invoice._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                whileHover={{ y: -4 }}
                className="group relative"
              >
                <div
                  className={`${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                      : 'bg-white/70 border-gray-200 hover:bg-white'
                  } backdrop-blur-sm rounded-xl border p-6 hover:shadow-xl transition-all duration-300 group h-full`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl ${
                          invoice.customer
                            ? 'bg-green-100 dark:bg-green-900/50'
                            : 'bg-orange-100 dark:bg-orange-900/50'
                        } flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        {invoice.customer ? (
                          <User
                            size={24}
                            className="text-green-600 dark:text-green-400"
                          />
                        ) : (
                          <Package
                            size={24}
                            className="text-orange-600 dark:text-orange-400"
                          />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-lg truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {invoice.customer?.name || 'Walk-in Customer'}
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Invoice #{invoice._id?.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price and Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(invoice.grandtotal)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.customer
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}
                      >
                        {invoice.customer ? 'With Customer' : 'Walk-in'}
                      </span>
                    </div>

                    {/* Customer Details */}
                    {invoice.customer && (
                      <div className="space-y-1 mb-3">
                        {invoice.customer.phone && (
                          <div className="flex items-center text-xs">
                            <Phone
                              size={12}
                              className={`mr-2 ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            />
                            <span
                              className={
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }
                            >
                              {invoice.customer.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Invoice Details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`flex items-center ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          <Calendar size={12} className="mr-2" />
                          Date
                        </span>
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {formatDate(invoice.createdat)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`flex items-center ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          <Package size={12} className="mr-2" />
                          Items
                        </span>
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {invoice.products?.length || 0} products
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {invoice.invoicepdf && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={invoice.invoicepdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1"
                      >
                        <Download size={14} />
                        Download
                      </motion.a>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
