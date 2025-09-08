import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Plus,
  Minus,
  Package,
  ShoppingCart,
  Save,
  Gift,
  Sparkles,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createGiftBox,
  updateGiftBox,
  fetchGiftBoxes
} from '../../../store/slices/giftBoxSlice';
import {
  fetchProducts,
  setSearchTerm
} from '../../../store/slices/productsSlice';

const GiftBoxBuilder = ({ isOpen, onClose, editingGiftBox }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const { cart, isCreating, isUpdating } = useSelector(
    (state) => state.giftBox
  );
  const { filteredProducts, loading, searchTerm } = useSelector(
    (state) => state.products
  );

  const [giftBoxName, setGiftBoxName] = useState('');
  const [giftBoxPrice, setGiftBoxPrice] = useState('');
  const [giftBoxStock, setGiftBoxStock] = useState(''); // Add this for manual stock input
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'cart'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProducts());
      if (editingGiftBox) {
        setGiftBoxName(editingGiftBox.name || '');
        setGiftBoxPrice(
          editingGiftBox.grandtotal?.toString() ||
            editingGiftBox.total?.toString() ||
            ''
        );
        setGiftBoxStock(editingGiftBox.stockavailable?.toString() || '1'); // Set existing stock

        // Populate cart with existing products
        const existingProducts =
          editingGiftBox.products?.map((p) => ({
            _id: p.productId?._id || p.productId || p._id,
            name: p.productId?.name || p.name,
            price: p.productId?.price || p.price,
            quantity: p.quantity,
            stockavailable: p.productId?.stockavailable || p.stockavailable
          })) || [];

        dispatch(clearCart());
        existingProducts.forEach((product) => {
          if (product._id && product.name && product.price) {
            dispatch(addToCart(product));
          }
        });
      } else {
        setGiftBoxName('');
        setGiftBoxPrice('');
        setGiftBoxStock(''); // Reset stock input
        dispatch(clearCart());
      }
    }
  }, [isOpen, editingGiftBox, dispatch]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);
    const quantity = existingItem ? existingItem.quantity + 1 : 1;

    if (quantity <= product.stockavailable) {
      dispatch(addToCart({ ...product, quantity }));
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      const product = cart.find((item) => item._id === productId);
      if (newQuantity <= product.stockavailable) {
        dispatch(updateCartQuantity({ id: productId, quantity: newQuantity }));
      }
    }
  };

  const handleSave = () => {
    if (
      !giftBoxName.trim() ||
      cart.length === 0 ||
      !giftBoxPrice.trim() ||
      !giftBoxStock.trim()
    ) {
      return;
    }

    const finalPrice = parseFloat(giftBoxPrice) || totalPrice;
    const stockAvailable = parseInt(giftBoxStock) || 1;

    // Validate that stock is a positive number
    if (stockAvailable <= 0) {
      alert('Stock available must be greater than 0');
      return;
    }

    const giftBoxData = {
      name: giftBoxName.trim(),
      products: cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity
      })),
      discount: 0,
      total: totalPrice,
      grandtotal: finalPrice,
      stockavailable: stockAvailable, // Use manual input instead of calculation
      status: true
    };

    if (editingGiftBox) {
      dispatch(updateGiftBox({ ...giftBoxData, _id: editingGiftBox._id }))
        .unwrap()
        .then(() => {
          // Refresh the gift box list
          dispatch(fetchGiftBoxes());
          onClose();
        })
        .catch((error) => {
          console.error('Update failed:', error);
        });
    } else {
      dispatch(createGiftBox(giftBoxData))
        .unwrap()
        .then(() => {
          // Refresh the gift box list
          dispatch(fetchGiftBoxes());
          onClose();
        })
        .catch((error) => {
          console.error('Create failed:', error);
        });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
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
        } rounded-2xl border shadow-2xl w-full max-w-6xl h-[95vh] md:h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div
          className={`${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Gift className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2
                className={`text-lg md:text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {editingGiftBox ? 'Edit Gift Box' : 'Create New Gift Box'}
              </h2>
              <p
                className={`text-xs md:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Select products to create the perfect gift combination
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

        {/* Mobile Tabs */}
        {isMobile && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Package size={16} />
              Products
              {cart.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'cart'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <ShoppingCart size={16} />
              Cart
              {cart.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Products Section - Visible on desktop or when active tab is products on mobile */}
          <div
            className={`${
              isMobile ? (activeTab === 'products' ? 'flex' : 'hidden') : 'flex'
            } flex-1 flex-col overflow-hidden`}
          >
            <div className="p-4 md:p-6 overflow-y-auto">
              {/* Gift Box Details */}
              <div className="mb-6">
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Gift Box Details
                </h3>

                <div className="mb-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Gift Box Name *
                    </label>
                    <input
                      type="text"
                      value={giftBoxName}
                      onChange={(e) => setGiftBoxName(e.target.value)}
                      placeholder="Enter gift box name"
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    />
                  </div>
                </div>
              </div>

              {/* Search Products */}
              <div className="mb-6">
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Select Products
                </h3>

                <div className="relative mb-4">
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
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(
                    (item) => item._id === product._id
                  );
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <motion.div
                      key={product._id}
                      whileHover={{ y: -2 }}
                      className={`${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      } border rounded-lg p-3 md:p-4 hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
                          } flex items-center justify-center`}
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
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-sm md:text-base truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {product.name}
                          </h4>
                          <p
                            className={`text-xs md:text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            Stock: {product.stockavailable}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-sm md:text-base ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          ₹{product.price}
                        </span>

                        {quantity > 0 ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(product._id, quantity - 1)
                              }
                              className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={product.stockavailable}
                              value={quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 0;
                                if (newQty <= product.stockavailable) {
                                  handleUpdateQuantity(product._id, newQty);
                                }
                              }}
                              className={`w-10 text-center text-xs font-medium border rounded px-1 py-1 ${
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(product._id, quantity + 1)
                              }
                              disabled={quantity >= product.stockavailable}
                              className="p-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stockavailable === 0}
                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs md:text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mobile View Cart Button */}
            {isMobile && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('cart')}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  View Cart ({totalItems})
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Cart Section - Visible on desktop or when active tab is cart on mobile */}
          <div
            className={`${
              isMobile ? (activeTab === 'cart' ? 'flex' : 'hidden') : 'flex'
            } flex-col ${
              isMobile
                ? 'w-full'
                : 'w-full md:w-80 lg:w-96 border-l border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {/* Mobile Back Button */}
              {isMobile && (
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4"
                >
                  <ChevronLeft size={16} />
                  Back to Products
                </button>
              )}

              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
                <h3
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Gift Box Items
                </h3>
              </div>

              {cart.length === 0 ? (
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
                    No items selected yet
                  </p>
                  {isMobile && (
                    <button
                      onClick={() => setActiveTab('products')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Browse Products
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } p-3 rounded-lg border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className={`font-medium text-sm truncate flex-1 mr-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            ₹{item.price} ×
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity - 1
                                )
                              }
                              className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stockavailable}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 0;
                                if (newQty <= item.stockavailable) {
                                  handleUpdateQuantity(item._id, newQty);
                                }
                              }}
                              className={`w-10 text-center text-xs font-medium border rounded px-1 py-1 ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.stockavailable}
                              className="p-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <span
                          className={`font-medium text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {cart.length > 0 && (
                <div
                  className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span
                        className={
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }
                      >
                        Total Items:
                      </span>
                      <span
                        className={
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }
                      >
                        {totalItems}
                      </span>
                    </div>

                    <div className="flex justify-between text-base">
                      <span
                        className={
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }
                      >
                        Estimated Total:
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label
                        className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Gift Box Price *
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
                          min="0"
                          step="0.01"
                          value={giftBoxPrice}
                          onChange={(e) => setGiftBoxPrice(e.target.value)}
                          placeholder={totalPrice.toString()}
                          className={`w-full pl-8 pr-3 py-2 rounded-lg border transition-colors ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                        />
                      </div>
                      <p
                        className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        Set your desired price for this gift box
                      </p>
                    </div>

                    {/* Stock Available Input */}
                    <div className="space-y-2">
                      <label
                        className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Stock Available
                      </label>
                      <div className="relative">
                        <span
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          📦
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={giftBoxStock}
                          onChange={(e) => setGiftBoxStock(e.target.value)}
                          placeholder="Enter available stock"
                          className={`w-full pl-8 pr-3 py-2 rounded-lg border transition-colors ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                        />
                      </div>
                      <p
                        className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        Number of gift boxes available for sale
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button - Fixed at bottom on mobile */}
            {cart.length > 0 && (
              <div
                className={`p-4 border-t border-gray-200 dark:border-gray-700 ${
                  isMobile ? 'sticky bottom-0 bg-inherit' : ''
                }`}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={
                    !giftBoxName.trim() ||
                    cart.length === 0 ||
                    !giftBoxPrice.trim() ||
                    !giftBoxStock.trim() ||
                    isCreating ||
                    isUpdating
                  }
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>
                        {editingGiftBox ? 'Updating...' : 'Creating...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>
                        {editingGiftBox ? 'Update Gift Box' : 'Create Gift Box'}
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GiftBoxBuilder;
