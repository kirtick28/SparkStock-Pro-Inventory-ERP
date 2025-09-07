import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Package,
  Search,
  Plus,
  Filter,
  TrendingUp,
  Star,
  ShoppingBag,
  Eye,
  Edit3,
  Trash2,
  Power,
  DollarSign,
  Box,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  fetchGiftBoxes,
  toggleGiftBoxStatus,
  deleteGiftBox,
  setSelectedGiftBox
} from '../../../store/slices/giftBoxSlice';
import { fetchProducts } from '../../../store/slices/productsSlice';
import useSmartFetch from '../../../hooks/useSmartFetch';
import Loader from '../../../components/common/Loader';
import GiftBoxBuilder from './GiftBoxBuilder';
import GiftBoxDetails from './GiftBoxDetails';

const GiftBoxDashboard = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const {
    giftBoxes,
    loading: reduxLoading,
    error,
    selectedGiftBox,
    isDeleting
  } = useSelector((state) => state.giftBox);

  const [showBuilder, setShowBuilder] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingGiftBox, setEditingGiftBox] = useState(null);

  // Smart fetching with caching
  const {
    loading: giftBoxLoading,
    refresh: refreshGiftBoxes,
    isDataStale: giftBoxDataStale
  } = useSmartFetch(fetchGiftBoxes, 'giftBox');

  const { loading: productsLoading, refresh: refreshProducts } = useSmartFetch(
    fetchProducts,
    'products'
  );

  const loading = giftBoxLoading || productsLoading;

  const filteredGiftBoxes = giftBoxes
    .filter((giftBox) => {
      const matchesSearch = giftBox.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && giftBox.status) ||
        (filterStatus === 'inactive' && !giftBox.status);

      const price = giftBox.grandtotal || giftBox.total || 0;
      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === 'low' && price < 500) ||
        (priceRange === 'medium' && price >= 500 && price < 2000) ||
        (priceRange === 'high' && price >= 2000);

      return matchesSearch && matchesStatus && matchesPrice;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'price':
          aValue = a.grandtotal || a.total || 0;
          bValue = b.grandtotal || b.total || 0;
          break;
        case 'items':
          aValue = a.products?.length || 0;
          bValue = b.products?.length || 0;
          break;
        case 'created':
          aValue = new Date(a.createdat || 0);
          bValue = new Date(b.createdat || 0);
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const stats = [
    {
      title: 'Total Gift Boxes',
      value: giftBoxes.length,
      icon: Gift,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Active Gift Boxes',
      value: giftBoxes.filter((gb) => gb.status).length,
      icon: Package,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Total Revenue',
      value: `₹${giftBoxes
        .reduce((acc, gb) => acc + (gb.grandtotal || gb.total || 0), 0)
        .toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
      change: '+25%'
    },
    {
      title: 'Avg Items per Box',
      value:
        giftBoxes.length > 0
          ? Math.round(
              giftBoxes.reduce(
                (acc, gb) => acc + (gb.products?.length || 0),
                0
              ) / giftBoxes.length
            )
          : 0,
      icon: Box,
      color: 'orange',
      change: '+5%'
    }
  ];

  const handleToggleStatus = (giftBox) => {
    dispatch(
      toggleGiftBoxStatus({ id: giftBox._id, currentStatus: giftBox.status })
    );
  };

  const handleDelete = (giftBoxId) => {
    if (window.confirm('Are you sure you want to delete this gift box?')) {
      dispatch(deleteGiftBox(giftBoxId))
        .unwrap()
        .then(() => {
          // Optionally refresh the list to ensure consistency
          dispatch(fetchGiftBoxes());
        })
        .catch((error) => {
          console.error('Delete failed:', error);
        });
    }
  };

  const handleEdit = (giftBox) => {
    setEditingGiftBox(giftBox);
    setShowBuilder(true);
  };

  const handleViewDetails = (giftBox) => {
    dispatch(setSelectedGiftBox(giftBox));
    setShowDetails(true);
  };

  const handleCreateNew = () => {
    setEditingGiftBox(null);
    setShowBuilder(true);
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setEditingGiftBox(null);
  };

  if (loading && giftBoxes.length === 0) {
    return <Loader />;
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
                  size={18}
                  className={`text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
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
        } backdrop-blur-sm rounded-xl border p-4 md:p-6 mb-6 md:mb-8`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
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
              placeholder="Search gift boxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="flex items-center gap-2">
              <DollarSign
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className={`px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="all">All Prices</option>
                <option value="low">Under ₹500</option>
                <option value="medium">₹500 - ₹2000</option>
                <option value="high">Above ₹2000</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <TrendingUp
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="items">Items Count</option>
                <option value="created">Created Date</option>
              </select>
            </div>

            {/* Sort Order Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? (
                <SortAsc size={16} />
              ) : (
                <SortDesc size={16} />
              )}
            </motion.button>

            {/* Create New Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Create Gift Box</span>
              <span className="sm:hidden">Create</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Gift Boxes Grid */}
      <AnimatePresence>
        {filteredGiftBoxes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white/70 border-gray-200'
            } backdrop-blur-sm rounded-xl border p-12 text-center`}
          >
            <Gift
              size={64}
              className={`mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              No gift boxes found
            </h3>
            <p
              className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {searchTerm || filterStatus !== 'all' || priceRange !== 'all'
                ? 'No gift boxes match your current filters. Try adjusting your search or filters.'
                : 'Create your first gift box to get started'}
            </p>
            {searchTerm || filterStatus !== 'all' || priceRange !== 'all' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setPriceRange('all');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 mr-3"
              >
                Clear Filters
              </motion.button>
            ) : null}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              Create Gift Box
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredGiftBoxes.map((giftBox, index) => (
              <motion.div
                key={giftBox._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className={`${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    : 'bg-white/70 border-gray-200 hover:bg-white'
                } backdrop-blur-sm rounded-xl border p-6 hover:shadow-xl transition-all duration-300 group`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${
                        theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                      } flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Gift
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-lg truncate ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {giftBox.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {giftBox.products?.length || 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleStatus(giftBox)}
                      className={`p-2 rounded-lg transition-colors ${
                        giftBox.status
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Power size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Price and Items */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      ₹
                      {(
                        giftBox.grandtotal ||
                        giftBox.total ||
                        0
                      ).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        giftBox.status
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {giftBox.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {giftBox.products && giftBox.products.length > 0 && (
                    <div className="flex -space-x-2 mb-3">
                      {giftBox.products.slice(0, 3).map((product, idx) => (
                        <div
                          key={idx}
                          className={`w-8 h-8 rounded-full ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          } flex items-center justify-center border-2 border-white dark:border-gray-800`}
                        >
                          <Package
                            size={14}
                            className={
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }
                          />
                        </div>
                      ))}
                      {giftBox.products.length > 3 && (
                        <div
                          className={`w-8 h-8 rounded-full ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                          } flex items-center justify-center border-2 border-white dark:border-gray-800 text-xs font-medium`}
                        >
                          +{giftBox.products.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewDetails(giftBox)}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(giftBox)}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1"
                  >
                    <Edit3 size={14} />
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(giftBox._id)}
                    disabled={isDeleting}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showBuilder && (
          <GiftBoxBuilder
            isOpen={showBuilder}
            onClose={handleBuilderClose}
            editingGiftBox={editingGiftBox}
          />
        )}

        {showDetails && selectedGiftBox && (
          <GiftBoxDetails
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            giftBox={selectedGiftBox}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftBoxDashboard;
