import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Upload,
  FileSpreadsheet,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const Popup = ({ onClose, onSave, type = 'add' }) => {
  const { theme } = useTheme();
  const [newProduct, setNewProduct] = useState({
    name: '',
    stockavailable: '',
    price: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddSubmit = async () => {
    if (!newProduct.name || !newProduct.stockavailable || !newProduct.price) {
      toast.error('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('cracker_token');
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/product/add`,
        newProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Product added successfully!');
      onSave();
      onClose();
      setNewProduct({ name: '', stockavailable: '', price: '' });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Server error, please try again');
        }
      } else {
        toast.error('Network error, please check your connection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    const token = localStorage.getItem('cracker_token');

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/product/bulkadd`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        toast.success('Data imported successfully!');
        onSave();
        onClose();
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Server error, please try again');
        }
      } else {
        toast.error('Network error, please check your connection');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          className={`${
            theme === 'dark'
              ? 'bg-gray-800/95 border-gray-700'
              : 'bg-white/95 border-gray-200'
          } backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 border`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 md:p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  type === 'add'
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                }`}
              >
                {type === 'add' ? (
                  <Plus
                    className={`w-5 h-5 ${
                      type === 'add'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  />
                ) : (
                  <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {type === 'add' ? 'Add New Product' : 'Import Products'}
                </h3>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {type === 'add'
                    ? 'Enter product details'
                    : 'Upload Excel file'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`p-2 rounded-xl ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } transition-colors`}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Content */}
          {type === 'add' ? (
            <div className="p-4 md:p-6 space-y-4 md:space-y-5">
              {/* Product Name */}
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Product Name *
                </label>
                <div className="relative">
                  <Package
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  placeholder="Enter stock quantity"
                  value={newProduct.stockavailable}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stockavailable: e.target.value
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Price (₹) *
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div
                className={`p-4 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-blue-900/20 border-blue-800'
                    : 'bg-blue-50 border-blue-200'
                } border`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                      }`}
                    >
                      Excel File Requirements
                    </p>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                      }`}
                    >
                      Upload an Excel file (.xlsx) with these columns:
                    </p>
                    <ul
                      className={`text-sm space-y-1 ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                      }`}
                    >
                      <li>
                        •{' '}
                        <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">
                          name
                        </code>{' '}
                        - Product Name
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">
                          price
                        </code>{' '}
                        - Product Price
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">
                          stockavailable
                        </code>{' '}
                        - Stock Quantity
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Select Excel File *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                    selectedFile
                      ? theme === 'dark'
                        ? 'border-emerald-600 bg-emerald-900/10'
                        : 'border-emerald-500 bg-emerald-50'
                      : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <div
                      className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                        selectedFile
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : theme === 'dark'
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                      }`}
                    >
                      <FileSpreadsheet
                        className={`w-6 h-6 ${
                          selectedFile
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>
                    {selectedFile ? (
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === 'dark'
                              ? 'text-emerald-400'
                              : 'text-emerald-600'
                          }`}
                        >
                          {selectedFile.name}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                          }`}
                        >
                          Drop your Excel file here
                        </p>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          or click to browse
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-end gap-3 p-4 md:p-6 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={type === 'add' ? handleAddSubmit : handleImportSubmit}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                type === 'add'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
              } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {type === 'add' ? 'Adding...' : 'Uploading...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {type === 'add' ? <Plus size={16} /> : <Upload size={16} />}
                  {type === 'add' ? 'Add Product' : 'Upload File'}
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Popup;
