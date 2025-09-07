import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Gift,
  DollarSign,
  Calendar,
  User,
  Tag,
  ShoppingBag,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const GiftBoxDetails = ({ isOpen, onClose, giftBox }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  if (!isOpen || !giftBox) return null;

  const totalItems =
    giftBox.products?.reduce((sum, product) => sum + product.quantity, 0) || 0;

  // Filter and sort products based on search and filters
  const filteredProducts = (giftBox.products || [])
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        } rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } px-6 py-4 border-b flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Gift className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Gift Box Details
              </h2>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                View complete gift box information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {/* Gift Box Info */}
          <div
            className={`${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            } rounded-xl p-6 mb-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {giftBox.name}
                </h3>
                {giftBox.description && (
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {giftBox.description}
                  </p>
                )}
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  giftBox.status
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {giftBox.status ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
                  <DollarSign
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ₹{(giftBox.grandtotal || giftBox.total || 0).toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Total Price
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
                  <Package
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {giftBox.products?.length || 0}
                </p>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Products
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
                  <ShoppingBag
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                </div>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {totalItems}
                </p>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Total Items
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-2">
                  <Tag
                    className="text-orange-600 dark:text-orange-400"
                    size={24}
                  />
                </div>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ₹
                  {totalItems > 0
                    ? Math.round(
                        (giftBox.grandtotal || giftBox.total || 0) / totalItems
                      )
                    : 0}
                </p>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Avg per Item
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div
            className={`${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-50 border-gray-200'
            } rounded-xl border p-4 mb-6`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Filter
                    size={16}
                    className={
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="all">All Products</option>
                    <option value="high-price">High Price</option>
                    <option value="low-price">Low Price</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="quantity">Quantity</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Controls */}
              <div className="flex sm:hidden items-center justify-between gap-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {/* Mobile Expanded Filters */}
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 sm:hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                      Filter
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Products</option>
                      <option value="high-price">High Price</option>
                      <option value="low-price">Low Price</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                      Sort By
                    </label>
                    <div className="flex gap-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="quantity">Quantity</option>
                      </select>

                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        }
                        className={`p-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {sortOrder === 'asc' ? (
                          <SortAsc size={16} />
                        ) : (
                          <SortDesc size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Products List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4
                className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Products in this Gift Box
              </h4>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {filteredProducts.length} of {giftBox.products?.length || 0}{' '}
                items
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    } rounded-lg p-4 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                        } flex items-center justify-center`}
                      >
                        <Package
                          size={20}
                          className={
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }
                        />
                      </div>
                      <div>
                        <h5
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {product.name}
                        </h5>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          ₹{product.price} each
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        ₹{(product.price * product.quantity).toLocaleString()}
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Qty: {product.quantity}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package
                  size={48}
                  className={`mx-auto mb-3 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`}
                />
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {searchTerm
                    ? 'No products match your search'
                    : 'No products found in this gift box'}
                </p>
              </div>
            )}
          </div>

          {/* Creation Info */}
          {giftBox.createdAt && (
            <div
              className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              } rounded-lg p-4 mt-6`}
            >
              <div className="flex items-center gap-2 text-sm">
                <Calendar
                  size={16}
                  className={
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }
                />
                <span
                  className={
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }
                >
                  Created on {new Date(giftBox.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GiftBoxDetails;
