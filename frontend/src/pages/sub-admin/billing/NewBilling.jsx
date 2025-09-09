import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  FileText,
  Download,
  Calculator,
  CreditCard,
  User,
  UserPlus
} from 'lucide-react';

const NewBilling = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [quantity, setQuantity] = useState('');
  const [isQuantityMode, setIsQuantityMode] = useState(false);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [giftBoxes, setGiftBoxes] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isGSTEnabled, setIsGSTEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Customer related states
  const [customerMode, setCustomerMode] = useState('none'); // 'none', 'existing', 'new'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [newCustomerInfo, setNewCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const searchInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const customerSearchRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchGiftBoxes();
    fetchCustomers();

    // Auto-focus search input on mount
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    // Keyboard shortcuts
    const handleGlobalKeyDown = (e) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search and focus
      if (e.key === 'Escape' && !isQuantityMode) {
        setSearchTerm('');
        setSelectedIndex(-1);
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isQuantityMode]);

  useEffect(() => {
    const combined = [
      ...products.map((p) => ({
        ...p,
        type: 'product',
        displayName: `${p.name} - ₹${p.price} (Stock: ${p.stockavailable})`
      })),
      ...giftBoxes.map((g) => ({
        ...g,
        type: 'giftbox',
        displayName: `${g.name} - ₹${g.grandtotal} (Stock: ${g.stockavailable})`
      }))
    ];
    setAllItems(combined);

    if (searchTerm.trim()) {
      const filtered = combined.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(combined);
    }
  }, [products, giftBoxes, searchTerm]);

  // Handle customer parameter from URL
  useEffect(() => {
    const customerId = searchParams.get('customer');
    if (customerId && customers.length > 0) {
      const customer = customers.find((c) => c._id === customerId);
      if (customer) {
        setCustomerMode('existing');
        setSelectedCustomer(customer);
        toast.success(`Customer ${customer.name} automatically selected`);
      }
    }
  }, [searchParams, customers]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('cracker_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/active`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchGiftBoxes = async () => {
    try {
      const token = localStorage.getItem('cracker_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/giftbox/active`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setGiftBoxes(response.data);
    } catch (error) {
      console.error('Error fetching gift boxes:', error);
      toast.error('Failed to load gift boxes');
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('cracker_token');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/customer/active`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please contact your administrator.');
      } else {
        toast.error(
          error.response?.data?.message || 'Failed to load customers'
        );
      }
    }
  };

  const handleKeyDown = (e) => {
    if (isQuantityMode) {
      if (e.key === 'Enter') {
        addToCart();
      } else if (e.key === 'Escape') {
        setIsQuantityMode(false);
        setQuantity('');
        setSelectedIndex(-1);
        searchInputRef.current?.focus();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
          setIsQuantityMode(true);
          setTimeout(() => quantityInputRef.current?.focus(), 100);
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setSelectedIndex(-1);
        break;
    }
  };

  const addToCart = () => {
    if (
      selectedIndex < 0 ||
      !filteredItems[selectedIndex] ||
      !quantity ||
      quantity <= 0
    ) {
      toast.error('Please select an item and enter valid quantity');
      return;
    }

    const selectedItem = filteredItems[selectedIndex];
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (qty > selectedItem.stockavailable) {
      toast.error(
        `Only ${selectedItem.stockavailable} units available in stock`
      );
      return;
    }

    const existingItemIndex = cart.findIndex(
      (item) => item.id === selectedItem._id && item.type === selectedItem.type
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      const newQty = newCart[existingItemIndex].quantity + qty;

      if (newQty > selectedItem.stockavailable) {
        toast.error(
          `Total quantity would exceed available stock (${selectedItem.stockavailable})`
        );
        return;
      }

      newCart[existingItemIndex].quantity = newQty;
      newCart[existingItemIndex].total =
        newQty * newCart[existingItemIndex].price;
      setCart(newCart);
    } else {
      const price =
        selectedItem.type === 'product'
          ? selectedItem.price
          : selectedItem.grandtotal;
      setCart([
        ...cart,
        {
          id: selectedItem._id,
          name: selectedItem.name,
          type: selectedItem.type,
          price: price,
          quantity: qty,
          total: qty * price,
          stockAvailable: selectedItem.stockavailable
        }
      ]);
    }

    // Reset and focus back to search
    setQuantity('');
    setIsQuantityMode(false);
    setSearchTerm('');
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
    toast.success(`${selectedItem.name} added to cart (Qty: ${qty})`);
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    toast.success('Item removed from cart');
  };

  const updateCartQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const item = cart[index];
    if (newQuantity > item.stockAvailable) {
      toast.error(`Only ${item.stockAvailable} units available`);
      return;
    }

    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].total = newQuantity * item.price;
    setCart(newCart);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const totalAfterDiscount = subtotal - discountAmount;
    const gstAmount = isGSTEnabled
      ? (totalAfterDiscount * gstPercentage) / 100
      : 0;
    const grandTotal = totalAfterDiscount + gstAmount;

    return {
      subtotal,
      discountAmount,
      totalAfterDiscount,
      gstAmount,
      grandTotal
    };
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const totals = calculateTotals();
    setLoading(true);

    try {
      const token = localStorage.getItem('cracker_token');

      // Validate cart items have required fields
      const products = cart
        .filter((item) => item.type === 'product')
        .map((item) => ({
          productId: item.id,
          quantity: parseInt(item.quantity) || 1
        }));

      const giftboxes = cart
        .filter((item) => item.type === 'giftbox')
        .map((item) => ({
          giftBoxId: item.id,
          quantity: parseInt(item.quantity) || 1
        }));

      // Ensure we have at least one item
      if (products.length === 0 && giftboxes.length === 0) {
        toast.error('No valid items in cart');
        return;
      }

      const orderData = {
        products,
        giftboxes,
        discount: parseFloat(discount) || 0,
        total: parseFloat(totals.totalAfterDiscount) || 0,
        grandtotal: parseFloat(totals.grandTotal) || 0,
        gst: {
          status: isGSTEnabled,
          percentage: isGSTEnabled ? parseFloat(gstPercentage) || 18 : 0,
          amount: isGSTEnabled ? parseFloat(totals.gstAmount) || 0 : 0
        }
      };

      // Add customer information based on mode
      if (customerMode === 'existing' && selectedCustomer) {
        orderData.id = selectedCustomer._id;
      } else if (customerMode === 'new' && newCustomerInfo.name.trim()) {
        orderData.customerInfo = {
          name: newCustomerInfo.name.trim(),
          phone: newCustomerInfo.phone.trim() || '',
          address: newCustomerInfo.address.trim() || '',
          city: newCustomerInfo.city?.trim() || '',
          state: newCustomerInfo.state?.trim() || '',
          pincode: newCustomerInfo.pincode?.trim() || ''
        };
      }

      console.log('Placing order with data:', orderData);

      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/order/place`,
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000 // 30 second timeout
        }
      );

      if (response.data.orderId) {
        setCurrentOrderId(response.data.orderId);

        // Check if PDF is immediately available
        if (response.data.pdfUrl) {
          setPdfUrl(response.data.pdfUrl);
          setShowPdfModal(true);
        } else {
          // PDF is being generated, show loading and poll for status
          setPdfGenerating(true);
          toast.info('Invoice is being generated...');
          pollForPDF(response.data.orderId);
        }
      }

      // Reset everything
      setCart([]);
      setDiscount(0);
      setCustomerMode('none');
      setSelectedCustomer(null);
      setNewCustomerInfo({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });

      toast.success('Order placed successfully!');
      fetchProducts(); // Refresh to get updated stock
      fetchGiftBoxes();
    } catch (error) {
      console.error('Error placing order:', error);

      // More detailed error handling
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - Please try again');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid order data');
      } else if (error.response?.status === 404) {
        toast.error('Product or customer not found');
      } else if (error.response?.status === 500) {
        toast.error('Server error - Please try again later');
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to poll for PDF generation status
  const pollForPDF = async (orderId, attempts = 0) => {
    const maxAttempts = 30; // Maximum 30 attempts (90 seconds)
    const interval = 3000; // 3 seconds between attempts

    if (attempts >= maxAttempts) {
      setPdfGenerating(false);
      toast.error(
        'PDF generation taking longer than expected. You can check the order status later or try regenerating the PDF.'
      );
      return;
    }

    try {
      const token = localStorage.getItem('cracker_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/order/status/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const {
        status,
        pdfUrl,
        message,
        attempts: serverAttempts
      } = response.data;

      if (status === 'completed' && pdfUrl) {
        setPdfUrl(pdfUrl);
        setShowPdfModal(true);
        setPdfGenerating(false);
        toast.success('Invoice generated successfully!');
      } else if (status === 'error') {
        setPdfGenerating(false);
        toast.error(`PDF generation failed: ${message}`);

        // Offer retry option if not too many attempts
        if (serverAttempts < 3) {
          toast.info('Automatic retry is in progress...', { autoClose: 2000 });
          setTimeout(() => pollForPDF(orderId, attempts + 1), interval * 2); // Wait longer before next check
        }
      } else {
        // Continue polling for processing status
        setTimeout(() => pollForPDF(orderId, attempts + 1), interval);

        // Show progress message periodically
        if (attempts % 5 === 0 && attempts > 0) {
          toast.info(`Still generating PDF... (${attempts * 3}s)`, {
            autoClose: 1500
          });
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      if (attempts < maxAttempts - 1) {
        setTimeout(() => pollForPDF(orderId, attempts + 1), interval);
      } else {
        setPdfGenerating(false);
        toast.error('Failed to check PDF generation status');
      }
    }
  };

  const totals = calculateTotals();

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Search and Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setCustomerMode('none')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    customerMode === 'none'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Walk-in Customer
                </button>
                <button
                  onClick={() => setCustomerMode('existing')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    customerMode === 'existing'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  onClick={() => setCustomerMode('new')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    customerMode === 'new'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  New Customer
                </button>
              </div>

              {customerMode === 'existing' && (
                <div className="space-y-2">
                  <input
                    ref={customerSearchRef}
                    type="text"
                    placeholder="Search customer by name or phone..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <div className="max-h-40 overflow-y-auto">
                    {customers
                      .filter(
                        (customer) =>
                          customer.name
                            .toLowerCase()
                            .includes(customerSearchTerm.toLowerCase()) ||
                          customer.phone.includes(customerSearchTerm)
                      )
                      .map((customer) => (
                        <div
                          key={customer._id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearchTerm('');
                          }}
                          className={`p-2 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 ${
                            selectedCustomer?._id === customer._id
                              ? 'bg-blue-100 dark:bg-gray-700'
                              : ''
                          }`}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {customer.phone}{' '}
                            {customer.address && `• ${customer.address}`}
                          </div>
                        </div>
                      ))}
                    {customers.filter(
                      (customer) =>
                        customer.name
                          .toLowerCase()
                          .includes(customerSearchTerm.toLowerCase()) ||
                        customer.phone.includes(customerSearchTerm)
                    ).length === 0 &&
                      customerSearchTerm && (
                        <div className="p-2 text-gray-500 dark:text-gray-400 text-center">
                          No customers found matching "{customerSearchTerm}"
                        </div>
                      )}
                  </div>
                  {selectedCustomer && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-400">
                            Selected: {selectedCustomer.name}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-500">
                            {selectedCustomer.phone}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCustomer(null)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 ml-2"
                          title="Clear selection"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {customerMode === 'new' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={newCustomerInfo.name}
                    onChange={(e) =>
                      setNewCustomerInfo({
                        ...newCustomerInfo,
                        name: e.target.value
                      })
                    }
                    className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newCustomerInfo.phone}
                    onChange={(e) =>
                      setNewCustomerInfo({
                        ...newCustomerInfo,
                        phone: e.target.value
                      })
                    }
                    className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newCustomerInfo.address}
                    onChange={(e) =>
                      setNewCustomerInfo({
                        ...newCustomerInfo,
                        address: e.target.value
                      })
                    }
                    className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newCustomerInfo.city}
                    onChange={(e) =>
                      setNewCustomerInfo({
                        ...newCustomerInfo,
                        city: e.target.value
                      })
                    }
                    className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newCustomerInfo.state}
                    onChange={(e) =>
                      setNewCustomerInfo({
                        ...newCustomerInfo,
                        state: e.target.value
                      })
                    }
                    className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newCustomerInfo.pincode}
                    onChange={(e) =>
                      setNewCustomerInfo({
                        ...newCustomerInfo,
                        pincode: e.target.value
                      })
                    }
                    className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <div className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400">
                    * Required field. Provide at least name and either phone or
                    address to save customer details.
                  </div>
                </div>
              )}
            </div>

            {/* Search Section */}
            <div
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Product & Gift Box Search
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowShortcutsHelp(true)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Shortcuts
                  </button>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredItems.length} / {allItems.length} items
                    {searchTerm && ` (filtered)`}
                  </div>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products and gift boxes... (Use arrow keys to navigate, Enter to select)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Quantity Input (appears when item is selected) */}
              {isQuantityMode && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400">
                      Selected: {filteredItems[selectedIndex]?.name}
                    </h4>
                    <button
                      onClick={() => {
                        setIsQuantityMode(false);
                        setQuantity('');
                        setSelectedIndex(-1);
                        searchInputRef.current?.focus();
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      title="Clear selection"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={quantityInputRef}
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      onKeyDown={handleKeyDown}
                      min="1"
                      max={filteredItems[selectedIndex]?.stockavailable || 1}
                      className={`flex-1 p-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    <button
                      onClick={addToCart}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Available: {filteredItems[selectedIndex]?.stockavailable}{' '}
                    units
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? 'No items found matching your search'
                      : 'No items available'}
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div
                      key={`${item._id}-${item.type}`}
                      onClick={() => {
                        if (item.stockavailable > 0) {
                          setSelectedIndex(index);
                          setIsQuantityMode(true);
                          setTimeout(
                            () => quantityInputRef.current?.focus(),
                            100
                          );
                        } else {
                          toast.error('This item is out of stock');
                        }
                      }}
                      className={`p-3 rounded-lg transition-colors ${
                        item.stockavailable === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      } ${
                        selectedIndex === index
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {item.name}
                            {item.stockavailable <= 5 &&
                              item.stockavailable > 0 && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                  Low Stock
                                </span>
                              )}
                            {item.stockavailable === 0 && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.type === 'product' ? (
                              <Package className="inline w-4 h-4 mr-1" />
                            ) : (
                              <ShoppingCart className="inline w-4 h-4 mr-1" />
                            )}
                            {item.type === 'product' ? 'Product' : 'Gift Box'} •
                            Stock: {item.stockavailable}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ₹
                            {item.type === 'product'
                              ? item.price
                              : item.grandtotal}
                          </div>
                          <div
                            className={`text-sm ${
                              item.stockavailable > 10
                                ? 'text-green-600'
                                : item.stockavailable > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {item.stockavailable > 0
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Cart and Totals */}
          <div className="space-y-6">
            {/* Cart */}
            <div
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({cart.length} items)
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.type === 'product' ? 'Product' : 'Gift Box'} • ₹
                          {item.price} each
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(index, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQuantity(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-16 text-center p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                          min="1"
                          max={item.stockAvailable}
                        />
                        <button
                          onClick={() =>
                            updateCartQuantity(index, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-bold">₹{item.total}</div>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Cart is empty. Search and add items above.
                  </div>
                )}
              </div>
            </div>

            {/* Billing Options */}
            <div
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Billing Options
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max="100"
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable GST</span>
                  <button
                    onClick={() => setIsGSTEnabled(!isGSTEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isGSTEnabled
                        ? 'bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isGSTEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isGSTEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      GST Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={gstPercentage}
                      onChange={(e) =>
                        setGstPercentage(parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      max="100"
                      className={`w-full p-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Bill Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({discount}%):</span>
                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>After Discount:</span>
                  <span>₹{totals.totalAfterDiscount.toFixed(2)}</span>
                </div>

                {isGSTEnabled && (
                  <div className="flex justify-between text-blue-600">
                    <span>GST ({gstPercentage}%):</span>
                    <span>+₹{totals.gstAmount.toFixed(2)}</span>
                  </div>
                )}

                <hr className="border-gray-300 dark:border-gray-600" />

                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total:</span>
                  <span>₹{totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || loading || pdfGenerating}
                className={`w-full mt-6 py-4 rounded-lg font-semibold transition-colors ${
                  cart.length === 0 || loading || pdfGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Order...
                  </div>
                ) : pdfGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Invoice...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Generate Bill & Print Invoice
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PDF Modal */}
        {showPdfModal && pdfUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`w-full max-w-4xl h-5/6 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">Invoice Generated</h3>
                <div className="flex gap-2">
                  <a
                    href={pdfUrl}
                    download
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={() => setShowPdfModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Invoice PDF"
              />
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help Modal */}
        {showShortcutsHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`w-full max-w-md rounded-lg p-6 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Focus search:</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                    Ctrl + F
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Navigate items:</span>
                  <div className="space-x-1">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                      ↑
                    </kbd>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                      ↓
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Select item:</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                    Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Add to cart:</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                    Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Cancel/Clear:</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                    Esc
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Back to search:</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                    Esc
                  </kbd>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  <strong>Workflow:</strong> Search → Arrow keys → Enter →
                  Quantity → Enter → Repeat
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBilling;
