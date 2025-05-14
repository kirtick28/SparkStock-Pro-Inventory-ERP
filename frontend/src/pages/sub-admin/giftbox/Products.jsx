import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GiftBoxSummary from './GiftBoxSummary';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const Products = ({ giftData, isEditing, onGiftOperationSuccess }) => {
  const { theme } = useTheme();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/active`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isEditing && giftData && products.length > 0) {
      const filteredProducts = products
        .filter((product) =>
          giftData.products.some(
            (giftProduct) =>
              String(giftProduct.productId) === String(product._id)
          )
        )
        .map((product) => {
          const giftProduct = giftData.products.find(
            (gp) => String(gp.productId) === String(product._id)
          );
          return {
            ...product,
            quantity: giftProduct?.quantity || 0
          };
        });

      setCart(filteredProducts);
    }
  }, [isEditing, giftData, products]);

  const handleQuantity = (product, delta) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((p) => p._id !== product._id);
        }
        return prev.map((p) =>
          p._id === product._id ? { ...p, quantity: newQuantity } : p
        );
      }
      return delta > 0 ? [...prev, { ...product, quantity: 1 }] : prev;
    });
  };

  const handleQuantityInput = (product, value) => {
    const numericValue = parseInt(value, 10);
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);
      if (existing) {
        if (isNaN(numericValue) || numericValue <= 0) {
          return prev.filter((p) => p._id !== product._id);
        }
        return prev.map((p) =>
          p._id === product._id ? { ...p, quantity: numericValue } : p
        );
      }
      return numericValue > 0
        ? [...prev, { ...product, quantity: numericValue }]
        : prev;
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-lg p-6 flex flex-col h-[85vh]`}
      >
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'border-gray-300'
            }`}
          />
        </div>

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
          <table className="w-full">
            <thead
              className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              } sticky top-0 z-10`} // Added z-10 here
            >
              <tr>
                <th
                  className={`p-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Product
                </th>
                <th
                  className={`p-3 text-right ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Stock
                </th>
                <th
                  className={`p-3 text-right ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Price
                </th>
                <th
                  className={`p-3 text-center ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((product) => {
                  const quantity =
                    cart.find((p) => p._id === product._id)?.quantity || 0;
                  return (
                    <tr
                      key={product._id}
                      className={`border-b ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 border-gray-700'
                          : 'hover:bg-gray-50 border-gray-200'
                      } ${
                        quantity > 0
                          ? theme === 'dark'
                            ? 'bg-gray-600'
                            : 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        }`}
                      >
                        {product.name}
                      </td>
                      <td
                        className={`p-3 text-right ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        }`}
                      >
                        {product.stockavailable}
                      </td>
                      <td
                        className={`p-3 text-right ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        }`}
                      >
                        ₹{product.price}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuantity(product, -1)}
                            className={`px-3 py-1 ${
                              theme === 'dark'
                                ? 'bg-red-900 text-red-200 hover:bg-red-800'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            } rounded ${
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
                          />
                          <button
                            onClick={() => handleQuantity(product, 1)}
                            className={`px-3 py-1 ${
                              theme === 'dark'
                                ? 'bg-green-900 text-green-200 hover:bg-green-800'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            } rounded`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {products.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      </div>

      <GiftBoxSummary
        giftData={giftData}
        isEditing={isEditing}
        cart={cart}
        total={total}
        removeFromCart={(id) =>
          setCart((prev) => prev.filter((p) => p._id !== id))
        }
        setCart={setCart}
        filteredProducts={cart}
        onSuccess={onGiftOperationSuccess} // Pass the callback here
      />

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

export default Products;
