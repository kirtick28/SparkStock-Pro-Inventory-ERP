import {
  Phone,
  CalendarDays,
  MapPin,
  Edit,
  Power,
  MoreVertical,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CustomerCard({ customer, onEdit, refreshCustomers }) {
  const { theme } = useTheme();
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium'
    }).format(new Date(dateString));
  };

  const handleStatusToggle = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      await axios.put(
        `${import.meta.env.VITE_BASEURL}/customer/`,
        {
          id: customer._id,
          status: !customer.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshCustomers();
      toast.success(
        `Customer status changed to ${!customer.status ? 'active' : 'inactive'}`
      );
    } catch (error) {
      toast.error('Failed to update customer status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl p-5 border transition-all duration-200 group overflow-hidden h-full flex flex-col ${
        theme === 'dark'
          ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-800 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/50'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
      }`}
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={`w-3 h-3 rounded-full ${
            customer.status
              ? 'bg-green-500 shadow-green-500/50'
              : 'bg-red-500 shadow-red-500/50'
          } shadow-lg animate-pulse`}
        />
      </div>

      {/* Header */}
      <div className="relative mb-4 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.15 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                customer.status
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              } text-white font-bold text-lg shadow-lg`}
            >
              {customer.name.charAt(0).toUpperCase()}
            </motion.div>

            <div className="min-w-0 flex-1">
              <h3
                className={`text-lg font-bold leading-tight truncate ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {customer.name}
              </h3>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  customer.status
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    customer.status ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {customer.status ? 'Active' : 'Inactive'}
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-4 flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
          className={`flex items-center space-x-3 group/item ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/80'
            } group-hover/item:bg-blue-500/10 transition-colors duration-150`}
          >
            <Phone size={14} className="text-blue-500" />
          </div>
          <span className="text-sm font-medium">{customer.phone}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.2 }}
          className={`flex items-start space-x-3 group/item ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <div
            className={`p-2 rounded-lg mt-0.5 ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/80'
            } group-hover/item:bg-blue-500/10 transition-colors duration-150`}
          >
            <MapPin size={14} className="text-blue-500" />
          </div>
          <span className="text-sm font-medium leading-relaxed line-clamp-2">
            {customer.address || 'No address provided'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.2 }}
          className={`flex items-center space-x-3 group/item ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/80'
            } group-hover/item:bg-blue-500/10 transition-colors duration-150`}
          >
            <CalendarDays size={14} className="text-blue-500" />
          </div>
          <span className="text-sm font-medium">
            Joined {formatDate(customer.createdat || customer.createdAt)}
          </span>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.2 }}
        className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(customer);
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 z-10 relative ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <Edit size={14} />
          <span>Edit</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle();
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 z-10 relative ${
            customer.status
              ? theme === 'dark'
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300'
                : 'bg-red-100 hover:bg-red-200 text-red-700'
              : theme === 'dark'
              ? 'bg-green-900/30 hover:bg-green-900/50 text-green-300'
              : 'bg-green-100 hover:bg-green-200 text-green-700'
          }`}
        >
          <Power size={14} />
          <span>{customer.status ? 'Deactivate' : 'Activate'}</span>
        </motion.button>
      </motion.div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200 -z-10" />
    </motion.div>
  );
}
