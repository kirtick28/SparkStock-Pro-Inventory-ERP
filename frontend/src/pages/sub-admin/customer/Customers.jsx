import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  Filter,
  Plus,
  RefreshCw,
  SortAsc,
  SortDesc,
  MoreVertical,
  Eye,
  Edit3,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  User,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import CustomerCard from '../../../components/CustomerCard';
import CreateCustomer from './Popup';
import { useTheme } from '../../../contexts/ThemeContext';
import Loader from '../../../components/common/Loader';

const Customers = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/customer/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers
    .filter((customer) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTermLower) ||
        customer.phone.toLowerCase().includes(searchTermLower) ||
        customer.address?.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && customer.status) ||
        (statusFilter === 'inactive' && !customer.status);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortBy === 'createdat') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate stats
  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Active Customers',
      value: customers.filter((c) => c.status).length,
      icon: UserCheck,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Inactive Customers',
      value: customers.filter((c) => !c.status).length,
      icon: UserX,
      color: 'red',
      change: '-5%'
    },
    {
      title: 'This Month',
      value: customers.filter((c) => {
        const customerDate = new Date(c.createdat);
        const now = new Date();
        return (
          customerDate.getMonth() === now.getMonth() &&
          customerDate.getFullYear() === now.getFullYear()
        );
      }).length,
      icon: TrendingUp,
      color: 'indigo',
      change: '+25%'
    }
  ];

  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setEditCustomer(null);
    setShowCreateModal(false);
  };

  const handleCreateNew = () => {
    setEditCustomer(null);
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (customer) => {
    const token = localStorage.getItem('cracker_token');
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/customer/`,
        {
          id: customer._id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          status: !customer.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        fetchCustomers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      const token = localStorage.getItem('cracker_token');
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_BASEURL}/customer/${customer._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          fetchCustomers(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const refreshData = () => {
    fetchCustomers();
  };

  return (
    <div
      className={`min-h-screen p-3 md:p-6 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {loading && <Loader />}

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
                    : stat.color === 'red'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
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
          {/* Search - Made more compact */}
          <div className="flex-1 min-w-0 relative">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search customers..."
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
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter
                size={16}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
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
                <option value="name">Sort by Name</option>
                <option value="createdat">Sort by Date</option>
                <option value="phone">Sort by Phone</option>
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
                onClick={refreshData}
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
                onClick={handleCreateNew}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Plus size={16} className="inline mr-1.5" />
                Add Customer
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
                onClick={refreshData}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateNew}
              className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
            >
              <Plus size={16} />
            </motion.button>
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
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="name">Name</option>
                      <option value="createdat">Date</option>
                      <option value="phone">Phone</option>
                    </select>

                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      className={`p-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
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
        </AnimatePresence>
      </motion.div>

      {/* Customer Grid */}
      <div className="p-0">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence>
                {filteredCustomers.map((customer, index) => (
                  <motion.div
                    key={customer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.02, duration: 0.3 }}
                    whileHover={{ y: -4 }}
                    className="group relative h-full"
                  >
                    <div
                      className={`${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                          : 'bg-white/70 border-gray-200 hover:bg-white'
                      } backdrop-blur-sm rounded-xl border p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                          <div
                            className={`w-12 h-12 rounded-xl ${
                              theme === 'dark'
                                ? 'bg-blue-900/50'
                                : 'bg-blue-100'
                            } flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                          >
                            <User
                              size={24}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-semibold text-lg truncate ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {customer.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Phone
                                size={14}
                                className={
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }
                              />
                              <p
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                {customer.phone}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleStatus(customer)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              customer.status
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {customer.status ? 'Active' : 'Inactive'}
                          </motion.button>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="mb-5 flex-1">
                        {customer.address && (
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin
                              size={14}
                              className={`mt-1 flex-shrink-0 ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            />
                            <p
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {customer.address}
                            </p>
                          </div>
                        )}

                        {customer.createdat && (
                          <div className="flex items-center gap-2 mt-4">
                            <Calendar
                              size={14}
                              className={
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }
                            />
                            <span
                              className={`text-xs ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              Joined{' '}
                              {new Date(
                                customer.createdat
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Top row - Edit and Delete */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(customer)}
                            className="flex-1 px-3 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1.5"
                          >
                            <Edit3 size={16} />
                            Edit
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(customer)}
                            className="flex-1 px-3 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={16} />
                            Delete
                          </motion.button>
                        </div>

                        {/* Bottom row - Create Bill */}
                        <Link
                          to={`/sub-admin/billing?customer=${customer._id}`}
                          className="block w-full px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-center"
                        >
                          <DollarSign size={16} className="inline mr-1.5" />
                          Create Bill
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredCustomers.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-12 ${
                  theme === 'dark'
                    ? 'bg-gray-700/30 border-gray-600'
                    : 'bg-gray-50 border-gray-300'
                } rounded-xl border border-dashed mt-6`}
              >
                <Users
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
                  No customers found
                </p>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first customer'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateNew}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    <Plus size={16} className="inline mr-1.5" />
                    Add First Customer
                  </motion.button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
      {/* Create/Edit Customer Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCustomer
            refreshCustomers={fetchCustomers}
            editData={editCustomer}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
