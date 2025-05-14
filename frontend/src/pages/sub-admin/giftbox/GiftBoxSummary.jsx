import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Wallet, Trash2, Save } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const GiftBoxSummary = ({
  giftData,
  cart,
  total,
  removeFromCart,
  setCart,
  filteredProducts,
  onSuccess // Added onSuccess prop
}) => {
  const { theme } = useTheme();
  const [inputGrandTotal, setInputGrandTotal] = useState(0);
  const [giftBoxName, setGiftBoxName] = useState('');
  const [giftBoxCount, setGiftBoxCount] = useState('');

  useEffect(() => {
    if (giftData) {
      setGiftBoxName(giftData.name || '');
      setGiftBoxCount(giftData.stockavailable || '');
      setInputGrandTotal(giftData.grandtotal || 0);
    }
  }, [giftData]);

  const validateForm = () => {
    if (!giftBoxName) {
      toast.error('Please enter the gift box name');
      return false;
    }
    if (!giftBoxCount || giftBoxCount <= 0) {
      toast.error('Please enter valid stock count');
      return false;
    }
    if (inputGrandTotal <= 0) {
      toast.error('Please enter valid grand total');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    const payload = {
      name: giftBoxName,
      products: (filteredProducts?.length ? filteredProducts : cart).map(
        (product) => ({
          productId: product._id,
          quantity: product.quantity || 0
        })
      ),
      total,
      grandtotal: Number(inputGrandTotal),
      stockavailable: Number(giftBoxCount)
    };

    if (giftData) payload._id = giftData._id;

    try {
      const method = giftData ? 'put' : 'post';
      const response = await axios[method](
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `Gift box ${giftData ? 'updated' : 'created'} successfully!`
        );
        setCart([]);
        // window.location.reload(); // Remove this line
        if (onSuccess) { // Call the onSuccess callback
          onSuccess();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div
      className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-xl shadow-lg p-6 h-[85vh] flex flex-col`}
    >
      <h2
        className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          theme === 'dark' ? 'text-gray-100' : ''
        }`}
      >
        <Wallet className="w-5 h-5" /> Gift Box Summary
      </h2>

      <div
        className={`mb-4 flex-1 overflow-y-auto ${
          theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor:
            theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
        }}
      >
        {(filteredProducts?.length ? filteredProducts : cart).length === 0 ? (
          <div
            className={`text-center p-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <p className="text-lg font-medium">Cart is empty</p>
            <p className="mt-2">Add products to create a gift box</p>
          </div>
        ) : (
          <table className="w-full">
            <thead
              className={`sticky top-0 z-10 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <tr>
                <th
                  className={`p-2 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Item
                </th>
                <th
                  className={`p-2 text-center ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Qty
                </th>
                <th
                  className={`p-2 text-right ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Total
                </th>
                <th
                  className={`p-2 ${theme === 'dark' ? 'text-gray-200' : ''}`}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(filteredProducts?.length ? filteredProducts : cart).map(
                (product) => (
                  <tr
                    key={product._id}
                    className={`border-b ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td
                      className={`p-2 ${
                        theme === 'dark' ? 'text-gray-200' : ''
                      }`}
                    >
                      {product.name}
                    </td>
                    <td
                      className={`p-2 text-center ${
                        theme === 'dark' ? 'text-gray-200' : ''
                      }`}
                    >
                      {product.quantity}
                    </td>
                    <td
                      className={`p-2 text-right ${
                        theme === 'dark' ? 'text-gray-200' : ''
                      }`}
                    >
                      ₹{(product.price * product.quantity).toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className={`p-1 rounded-full ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      <div
        className={`space-y-3 mb-6 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        <div>
          <label
            className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : ''
            }`}
          >
            Gift Box Name
          </label>
          <input
            value={giftBoxName}
            onChange={(e) => setGiftBoxName(e.target.value)}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'border-gray-300'
            }`}
            placeholder="Enter gift box name"
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : ''
            }`}
          >
            Stock Quantity
          </label>
          <input
            type="number"
            value={giftBoxCount}
            onChange={(e) => setGiftBoxCount(e.target.value)}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'border-gray-300'
            }`}
            min="0"
          />
        </div>

        <div className="flex justify-between items-center">
          <span>Total:</span>
          <span>₹{total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Grand Total:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputGrandTotal}
              onChange={(e) => setInputGrandTotal(e.target.value)}
              className={`w-32 p-1 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'border-gray-300'
              }`}
              min="0"
              placeholder="Enter grand total"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCart([])}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Trash2 size={18} /> Clear All
        </button>
        <button
          onClick={handleCheckout}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Save size={18} /> {giftData ? 'Save Changes' : 'Create Gift Box'}
        </button>
      </div>

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

export default GiftBoxSummary;
