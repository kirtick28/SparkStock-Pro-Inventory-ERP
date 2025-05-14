import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../../contexts/ThemeContext';
import { ShoppingCart, Save, CreditCard, Trash2 } from 'lucide-react';

const BillingSummary = ({
  SetSelectedGift,
  SelectedGift,
  showPopup,
  gifts,
  id,
  setPdfUrl,
  cart,
  discount,
  setDiscount,
  setCart,
  isGSTEnabled,
  setIsGSTEnabled,
  gstPercentage,
  setGstPercentage
}) => {
  const { theme } = useTheme();
  const [savedData, setSavedData] = useState(null);

  const selectedGiftTotal = SelectedGift.reduce(
    (sum, item) => sum + item.grandtotal * item.quantity,
    0
  );

  const updatedTotal =
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    selectedGiftTotal;

  const grandTotal = updatedTotal - updatedTotal * (discount / 100);
  const gstAmount = isGSTEnabled ? (grandTotal * gstPercentage) / 100 : 0;
  const calculatedGrandTotal = grandTotal + gstAmount;

  const removeFromGift = (_id) => {
    SetSelectedGift(SelectedGift.filter((item) => item._id !== _id));
  };

  const removeFromCart = (_id) => {
    setCart(cart.filter((item) => item._id !== _id));
  };

  const requestData = {
    id: id,
    products: cart.map((item) => ({
      productId: item._id,
      quantity: item.quantity
    })),
    giftboxes: SelectedGift.map((item) => ({
      giftBoxId: item._id,
      quantity: item.quantity
    })),
    discount,
    total: updatedTotal,
    gst: {
      status: isGSTEnabled,
      percentage: gstPercentage,
      amount: gstAmount.toFixed(2)
    },
    grandtotal: calculatedGrandTotal.toFixed(2)
  };

  const handleCheckout = async () => {
    if (cart.length === 0 && SelectedGift.length === 0) {
      toast.error('Cart is empty! Add items to proceed.');
      return;
    }

    try {
      const token = localStorage.getItem('cracker_token');
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/order/place-order`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response data after billing:', response);
      console.log('Response URL:', response.data.invoiceurl);

      if (response.status === 200 || response.status === 201) {
        setPdfUrl(response.data.invoiceurl);
        toast.success('Order placed successfully!');
        setCart([]);
        SetSelectedGift([]);

        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleSave = async () => {
    setSavedData(requestData);

    try {
      const token = localStorage.getItem('cracker_token');
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/cart/save`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        toast.success('Data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data. Please try again.');
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
        <ShoppingCart className="w-5 h-5" /> Cart Summary
      </h2>

      <div
        className={`mb-4 h-[400px] overflow-y-auto ${
          theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor:
            theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
        }}
      >
        {cart.length === 0 && SelectedGift.length === 0 ? (
          <div
            className={`text-center p-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <p className="text-lg font-medium">Cart is empty</p>
            <p className="mt-2">Add products or gift boxes to proceed</p>
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
                  Subtotal
                </th>
                <th
                  className={`p-2 ${theme === 'dark' ? 'text-gray-200' : ''}`}
                ></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr
                  key={item._id}
                  className={`border-b ${
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td
                    className={`p-2 ${theme === 'dark' ? 'text-gray-200' : ''}`}
                  >
                    {item.name}
                  </td>
                  <td
                    className={`p-2 text-center ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className={`p-2 text-right ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}
                  >
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeFromCart(item._id)}
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
              ))}
              {SelectedGift.map((item, index) => (
                <tr
                  key={item._id}
                  className={`border-b ${
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td
                    className={`p-2 ${theme === 'dark' ? 'text-gray-200' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">🎁</span>
                      {item.name}
                    </div>
                  </td>
                  <td
                    className={`p-2 text-center ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className={`p-2 text-right ${
                      theme === 'dark' ? 'text-gray-200' : ''
                    }`}
                  >
                    ₹{(item.grandtotal * item.quantity).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeFromGift(item._id)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className={`space-y-3 mb-6 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        <div className="flex justify-between items-center">
          <span>Subtotal:</span>
          <span>₹{updatedTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Discount (%):</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className={`w-16 p-1 border rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <span>-₹{(updatedTotal * (discount / 100)).toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isGSTEnabled}
              onChange={(e) => setIsGSTEnabled(e.target.checked)}
              className="form-checkbox"
            />
            <span>GST (%):</span>
            <input
              type="number"
              min="0"
              max="100"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(Number(e.target.value))}
              disabled={!isGSTEnabled}
              className={`w-16 p-1 border rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300'
              } ${!isGSTEnabled ? 'opacity-50' : ''}`}
            />
          </div>
          <span>+₹{gstAmount.toLocaleString()}</span>
        </div>

        <div
          className={`flex justify-between items-center pt-3 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } font-bold`}
        >
          <span>Grand Total:</span>
          <span>₹{calculatedGrandTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Save size={18} /> Save
        </button>
        <button
          onClick={handleCheckout}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <CreditCard size={18} /> Checkout
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

export default BillingSummary;
