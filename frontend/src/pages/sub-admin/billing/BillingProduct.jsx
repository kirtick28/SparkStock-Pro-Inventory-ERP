import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillingSummary from './BillingSummary';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { Loader, Search, ShoppingCart, Package } from 'lucide-react';
import GiftPopup from './GiftPopup';

const BillingProduct = () => {
  const { theme } = useTheme();
  const [gifts, setGifts] = useState([]);
  const { id, name } = useParams();
  const [SelectedGift, SetSelectedGift] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(50);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isGSTEnabled, setIsGSTEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);

  const fetchGiftData = async () => {
    try {
      const token = localStorage.getItem('cracker_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/giftbox/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setGifts(response.data);
    } catch (error) {
      console.error('Error fetching gift data:', error);
      toast.error('Failed to load gift boxes');
    }
  };

  useEffect(() => {
    fetchGiftData();
  }, []);

  const getProducts = async () => {
    const token = localStorage.getItem('cracker_token');

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products: ', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getcartdata = async () => {
    const token = localStorage.getItem('cracker_token');

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/cart/pending/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.status === 204) {
        return;
      }
      const ReturnCart = response.data;
      setDiscount(ReturnCart.discount);
      setIsGSTEnabled(ReturnCart.gst.status);
      setGstPercentage(ReturnCart.gst.percentage);

      // Process products
      const CartProducts = [];
      for (let i = 0; i < response.data.products.length; i++) {
        const cartItem = response.data.products[i];
        const product = products.find(
          (product) => String(product._id) === String(cartItem.productId)
        );

        if (product) {
          if (product.stockavailable === 0) {
            toast.error(
              `Product "${product.name}" is out of stock and has been removed from the cart.`
            );
          } else if (cartItem.quantity > product.stockavailable) {
            toast.warning(
              `The quantity of "${product.name}" in the cart has been adjusted to the available stock (${product.stockavailable}).`
            );
            product.quantity = product.stockavailable;
            CartProducts.push(product);
          } else {
            product.quantity = cartItem.quantity;
            CartProducts.push(product);
          }
        } else {
          toast.error(
            `Product with ID "${cartItem.productId}" is no longer available.`
          );
        }
      }
      setCart(CartProducts);

      // Process gift boxes
      const CartGiftBoxes = [];
      for (let i = 0; i < (response.data.giftboxes || []).length; i++) {
        const giftBoxItem = response.data.giftboxes[i];
        const giftBox = gifts.find(
          (gift) => String(gift._id) === String(giftBoxItem.giftBoxId)
        );

        if (giftBox) {
          if (giftBox.stockavailable === 0) {
            toast.error(
              `Gift box "${giftBox.name}" is out of stock and has been removed from the cart.`
            );
          } else if (giftBoxItem.quantity > giftBox.stockavailable) {
            toast.warning(
              `The quantity of "${giftBox.name}" in the cart has been adjusted to the available stock (${giftBox.stockavailable}).`
            );
            giftBox.quantity = giftBox.stockavailable;
            CartGiftBoxes.push(giftBox);
          } else {
            giftBox.quantity = giftBoxItem.quantity;
            CartGiftBoxes.push(giftBox);
          }
        } else {
          toast.error(
            `Gift box with ID "${giftBoxItem.giftBoxId}" is no longer available.`
          );
        }
      }
      SetSelectedGift(CartGiftBoxes);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Handle 400 error
      } else {
        console.error('Error fetching cart data: ', error);
        toast.error('An error occurred while fetching cart data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0 && gifts.length > 0) {
      getcartdata();
    }
  }, [products, gifts]);

  const updateCart = (product, value) => {
    const newQuantity = Math.max(0, Math.min(value, product.stockavailable));
    if (value > product.stockavailable) {
      toast.warning(
        `The quantity of "${product.name}" cannot exceed the available stock (${product.stockavailable}).`
      );
    }

    const updatedCart = cart
      .map((item) => {
        if (item._id === product._id) {
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
      .filter((item) => item !== null);

    if (newQuantity > 0 && !cart.find((item) => item._id === product._id)) {
      updatedCart.push({ ...product, quantity: newQuantity });
    }

    setCart(updatedCart);
  };

  const incrementQuantity = (product) => {
    const item = cart.find((item) => item._id === product._id);
    const currentQuantity = item?.quantity || 0;

    if (currentQuantity < product.stockavailable) {
      updateCart(product, currentQuantity + 1);
    }
  };

  const decrementQuantity = (product) => {
    const item = cart.find((item) => item._id === product._id);
    const currentQuantity = item?.quantity || 0;

    if (currentQuantity > 0) {
      updateCart(product, currentQuantity - 1);
    }
  };

  const handleQuantityInput = (product, value) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      updateCart(product, 0);
    } else {
      updateCart(product, numericValue);
    }
  };

  const removeFromCart = (_id) => {
    setCart(cart.filter((item) => item._id !== _id));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-lg p-6 flex flex-col h-[85vh]`}
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-3 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'border-gray-300'
              }`}
            />
          </div>

          <button
            onClick={() => setShowPopup(true)}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Package size={18} />
            Gift Boxes
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <Loader className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div
            className={`flex-1 overflow-y-auto ${
              theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor:
                theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
            }}
          >
            <table className="w-full border-collapse table-fixed">
              <thead
                className={`${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                } sticky top-0 z-10`}
              >
                <tr>
                  <th
                    className={`p-4 text-left font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    } w-[35%]`}
                  >
                    Product
                  </th>
                  <th
                    className={`p-4 text-right font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    } w-[15%]`}
                  >
                    Stock
                  </th>
                  <th
                    className={`p-4 text-right font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    } w-[15%]`}
                  >
                    Price
                  </th>
                  <th
                    className={`p-4 text-center font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    } w-[20%]`}
                  >
                    Quantity
                  </th>
                  <th
                    className={`p-4 text-right font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    } w-[15%]`}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((product) =>
                    product.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((product) => {
                    const cartItem = cart.find(
                      (item) => item._id === product._id
                    );
                    const quantity = cartItem ? cartItem.quantity : 0;

                    return (
                      <tr
                        key={product._id}
                        className={`border-b transition-colors duration-200 ${
                          theme === 'dark'
                            ? 'border-gray-700 hover:bg-gray-600'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${
                          quantity > 0
                            ? theme === 'dark'
                              ? 'bg-gray-600'
                              : 'bg-blue-50'
                            : ''
                        }`}
                      >
                        <td
                          className={`p-4 ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          } truncate`}
                        >
                          {product.name}
                        </td>
                        <td
                          className={`p-4 text-right ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          }`}
                        >
                          {product.stockavailable}
                        </td>
                        <td
                          className={`p-4 text-right ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          }`}
                        >
                          ₹{product.price}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => decrementQuantity(product)}
                              className={`px-3 py-1 rounded ${
                                theme === 'dark'
                                  ? 'bg-red-900 text-red-200 hover:bg-red-800'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              } ${
                                quantity === 0
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              disabled={quantity === 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) =>
                                handleQuantityInput(product, e.target.value)
                              }
                              className={`w-16 p-1 border rounded text-center ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                                  : 'border-gray-300 bg-white text-gray-800'
                              } focus:ring-2 focus:ring-blue-500`}
                              min="0"
                              max={product.stockavailable}
                            />
                            <button
                              onClick={() => incrementQuantity(product)}
                              className={`px-3 py-1 rounded ${
                                theme === 'dark'
                                  ? 'bg-green-900 text-green-200 hover:bg-green-800'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              } ${
                                product.stockavailable === 0 ||
                                quantity >= product.stockavailable
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              disabled={
                                product.stockavailable === 0 ||
                                quantity >= product.stockavailable
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td
                          className={`p-4 text-right ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          } truncate`}
                        >
                          ₹{(product.price * quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {products.filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <div
                className={`text-center p-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                No products found
              </div>
            )}
          </div>
        )}
      </div>

      <BillingSummary
        SetSelectedGift={SetSelectedGift}
        SelectedGift={SelectedGift}
        showPopup={showPopup}
        gifts={gifts}
        id={id}
        setPdfUrl={setPdfUrl}
        cart={cart}
        discount={discount}
        setDiscount={setDiscount}
        setCart={setCart}
        isGSTEnabled={isGSTEnabled}
        setIsGSTEnabled={setIsGSTEnabled}
        gstPercentage={gstPercentage}
        setGstPercentage={setGstPercentage}
      />

      {showPopup && (
        <GiftPopup
          fetchGiftData={fetchGiftData}
          SelectedGifts={SelectedGift}
          setSelectedGifts={SetSelectedGift}
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          gifts={gifts}
        />
      )}

      {pdfUrl && (
        <div className="col-span-2 mt-6">
          <h3
            className={`text-lg font-bold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : ''
            }`}
          >
            Invoice
          </h3>
          <iframe
            src={pdfUrl}
            title="Invoice PDF"
            className="w-full h-[600px] border rounded-lg"
          ></iframe>
        </div>
      )}

      <style>
        {`
          .scrollbar-dark::-webkit-scrollbar {
            width: 8px;
          }
          .scrollbar-dark::-webkit-scrollbar-track {
            background: #1F2937;
          }
          .scrollbar-dark::-webkit-scrollbar-thumb {
            background: #4B5563;
            border-radius: 4px;
          }
          .scrollbar-dark::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }
          .scrollbar-light::-webkit-scrollbar {
            width: 8px;
          }
          .scrollbar-light::-webkit-scrollbar-track {
            background: #FFFFFF;
          }
          .scrollbar-light::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 4px;
          }
          .scrollbar-light::-webkit-scrollbar-thumb:hover {
            background: #B0B7C0;
          }
        `}
      </style>
    </div>
  );
};

export default BillingProduct;
