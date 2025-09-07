import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Upload,
  Edit3,
  Save,
  X,
  Filter,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  SortAsc,
  SortDesc
} from 'lucide-react';
import Popup from './Popup';
import { useTheme } from '../../../contexts/ThemeContext';
import Loader from '../../../components/common/Loader';

function StockTable() {
  const { theme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editCracker, setEditCracker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const getProducts = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 500) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Server error, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleUpdate = async (crackerId) => {
    const token = localStorage.getItem('cracker_token');
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASEURL}/product/update`,
        editCracker,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success('Product updated successfully!');
        getProducts();
        setEditCracker(null);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        } else if (error.response.status === 404) {
          toast.error('Product not found');
        } else {
          toast.error('Server error, please try again');
        }
      } else {
        toast.error('Network error, please check your connection');
      }
    }
  };

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && product.status) ||
        (filterStatus === 'inactive' && !product.status) ||
        (filterStatus === 'low-stock' && product.stockavailable < 10);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

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

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Active Products',
      value: products.filter((p) => p.status).length,
      icon: CheckCircle,
      color: 'green',
      change: '+5%'
    },
    {
      title: 'Low Stock',
      value: products.filter((p) => p.stockavailable < 10).length,
      icon: AlertTriangle,
      color: 'yellow',
      change: '-3%'
    },
    {
      title: 'Total Revenue',
      value: `₹${products
        .reduce((acc, p) => acc + p.price * p.totalsales, 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      color: 'indigo',
      change: '+18%'
    }
  ];

  const getStatusColor = (status) => {
    return status
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-600 dark:text-red-400';
    if (stock < 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      {loading && <Loader />}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
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
            } backdrop-blur-sm rounded-xl border p-4 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-lg md:text-xl font-bold mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    stat.change.startsWith('+')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div
                className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}
              >
                <stat.icon
                  size={20}
                  className={`text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search, Filter and Action Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        } backdrop-blur-sm rounded-xl border p-4 mb-6`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="low-stock">Low Stock</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stockavailable">Stock</option>
                <option value="totalsales">Sales</option>
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
                onClick={() => setShowImportModal(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <Upload size={16} className="mr-1.5" />
                Import
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={16} className="mr-1.5" />
                Add Product
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Display */}
      <AnimatePresence mode="wait">
        {filteredAndSortedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            } backdrop-blur-sm rounded-xl border p-8 text-center`}
          >
            <Package
              size={48}
              className={`mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}
            />
            <h3
              className={`text-lg font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              No products found
            </h3>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Try adjusting your search or filters
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Desktop & Laptop: Table View */}
            <div className="hidden md:block">
              <div
                className={`${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-white border-gray-200'
                } backdrop-blur-sm rounded-xl border overflow-hidden`}
              >
                {/* Table Header */}
                <div
                  className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                  } px-6 py-4 border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold">
                    <div
                      className={`col-span-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Product
                    </div>
                    <div
                      className={`col-span-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Stock
                    </div>
                    <div
                      className={`col-span-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Price
                    </div>
                    <div
                      className={`col-span-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Sales
                    </div>
                    <div
                      className={`col-span-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Status
                    </div>
                    <div
                      className={`col-span-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Actions
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Name */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            } flex items-center justify-center flex-shrink-0`}
                          >
                            <Package
                              size={20}
                              className={
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            {editCracker?._id === product._id ? (
                              <input
                                type="text"
                                value={editCracker.name}
                                onChange={(e) =>
                                  setEditCracker({
                                    ...editCracker,
                                    name: e.target.value
                                  })
                                }
                                className={`w-full font-medium px-2 py-1 rounded border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-white border-gray-300'
                                }`}
                              />
                            ) : (
                              <h3
                                className={`font-medium truncate ${
                                  theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                {product.name}
                              </h3>
                            )}
                            <p
                              className={`text-xs ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              ID: {product._id.slice(-6)}
                            </p>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="col-span-2">
                          {editCracker?._id === product._id ? (
                            <input
                              type="number"
                              value={editCracker.stockavailable}
                              onChange={(e) =>
                                setEditCracker({
                                  ...editCracker,
                                  stockavailable: e.target.value
                                })
                              }
                              className={`w-full px-2 py-1 rounded border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                                  : 'bg-white border-gray-300'
                              }`}
                            />
                          ) : (
                            <span
                              className={`font-semibold ${getStockColor(
                                product.stockavailable
                              )}`}
                            >
                              {product.stockavailable}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="col-span-2">
                          {editCracker?._id === product._id ? (
                            <input
                              type="number"
                              value={editCracker.price}
                              onChange={(e) =>
                                setEditCracker({
                                  ...editCracker,
                                  price: e.target.value
                                })
                              }
                              className={`w-full px-2 py-1 rounded border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                                  : 'bg-white border-gray-300'
                              }`}
                            />
                          ) : (
                            <span
                              className={`font-semibold ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        {/* Sales */}
                        <div className="col-span-2">
                          <div>
                            <span
                              className={`font-semibold ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {product.totalsales}
                            </span>
                            <p
                              className={`text-xs ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              ₹
                              {(
                                product.price * product.totalsales
                              ).toLocaleString()}{' '}
                              revenue
                            </p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          {editCracker?._id === product._id ? (
                            <select
                              value={editCracker.status}
                              onChange={(e) =>
                                setEditCracker({
                                  ...editCracker,
                                  status: e.target.value === 'true'
                                })
                              }
                              className={`px-2 py-1 rounded border text-sm ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                product.status
                              )}`}
                            >
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1">
                            {editCracker?._id === product._id ? (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdate(product._id)}
                                  className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                >
                                  <Save size={14} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setEditCracker(null)}
                                  className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <X size={14} />
                                </motion.button>
                              </>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditCracker(product)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <Edit3 size={14} />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile & Tablet: Card View */}
            <div className="md:hidden space-y-4">
              {filteredAndSortedProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } backdrop-blur-sm rounded-xl border p-4 hover:shadow-lg transition-all duration-300`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        } flex items-center justify-center`}
                      >
                        <Package
                          size={24}
                          className={
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editCracker?._id === product._id ? (
                          <input
                            type="text"
                            value={editCracker.name}
                            onChange={(e) =>
                              setEditCracker({
                                ...editCracker,
                                name: e.target.value
                              })
                            }
                            className={`w-full font-semibold text-lg px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        ) : (
                          <h3
                            className={`font-semibold text-lg truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {product.name}
                          </h3>
                        )}
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          ID: {product._id.slice(-6)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {editCracker?._id === product._id ? (
                      <select
                        value={editCracker.status}
                        onChange={(e) =>
                          setEditCracker({
                            ...editCracker,
                            status: e.target.value === 'true'
                          })
                        }
                        className={`px-3 py-1 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3">
                    {/* Stock & Price Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        {editCracker?._id === product._id ? (
                          <input
                            type="number"
                            value={editCracker.stockavailable}
                            onChange={(e) =>
                              setEditCracker({
                                ...editCracker,
                                stockavailable: e.target.value
                              })
                            }
                            className={`w-full text-center px-2 py-1 rounded border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        ) : (
                          <p
                            className={`font-bold text-lg ${getStockColor(
                              product.stockavailable
                            )}`}
                          >
                            {product.stockavailable}
                          </p>
                        )}
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Stock
                        </p>
                      </div>

                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        {editCracker?._id === product._id ? (
                          <input
                            type="number"
                            value={editCracker.price}
                            onChange={(e) =>
                              setEditCracker({
                                ...editCracker,
                                price: e.target.value
                              })
                            }
                            className={`w-full text-center px-2 py-1 rounded border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        ) : (
                          <p className="font-bold text-lg">₹{product.price}</p>
                        )}
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Price
                        </p>
                      </div>
                    </div>

                    {/* Sales & Revenue Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                          {product.totalsales}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Sales
                        </p>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                          ₹
                          {(
                            product.price * product.totalsales
                          ).toLocaleString()}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Revenue
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      {editCracker?._id === product._id ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdate(product._id)}
                            className="px-4 py-2 text-green-600 bg-green-100 dark:bg-green-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <Save size={16} />
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditCracker(null)}
                            className="px-4 py-2 text-red-600 bg-red-100 dark:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <X size={16} />
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditCracker(product)}
                          className="px-4 py-2 text-blue-600 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit3 size={16} />
                          Edit
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <Popup
            type="add"
            onClose={() => setShowAddModal(false)}
            onSave={getProducts}
          />
        )}
        {showImportModal && (
          <Popup
            type="import"
            onClose={() => setShowImportModal(false)}
            onSave={getProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default StockTable;
