import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, Phone, Home, Loader, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const HistoryCard = ({ searchTerm, sortOrder }) => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCustomerData = async () => {
      const token = localStorage.getItem('cracker_token');
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASEURL}/customer/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerData(response.data);
      } catch (error) {
        toast.error('Failed to fetch customer data. Please try again.', {
          autoClose: 3000,
          theme: theme
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [theme]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader
          size={48}
          className={`animate-spin ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`}
        />
      </div>
    );
  }

  const filteredData = customerData.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = a.latestOrderDate ? new Date(a.latestOrderDate) : 0;
    const dateB = b.latestOrderDate ? new Date(b.latestOrderDate) : 0;
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (sortedData.length === 0) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4" />
          <p className="text-xl font-semibold">No Purchase History Found</p>
          <p className="text-sm mt-2">
            {searchTerm
              ? 'No results match your search.'
              : 'It looks like you haven’t made any purchases yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedData.map((customer) => (
          <div
            key={customer._id}
            className={`rounded-xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-200'
                : 'bg-white text-gray-900'
            } border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            } transition-all duration-300`}
          >
            <div className="p-6">
              <div className="flex flex-row items-start mb-4">
                <div className="flex-1">
                  <p className="flex items-center mb-3">
                    <Home
                      className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    />
                    <span className="font-semibold text-lg">
                      {customer.name}
                    </span>
                  </p>
                  <p className="flex items-center mb-3">
                    <Phone
                      className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    />
                    <span>{customer.phone}</span>
                  </p>
                  <p className="flex items-center">
                    <svg
                      className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{customer.address}</span>
                  </p>
                </div>
                <div className="text-right">
                  <h1
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    ₹
                    {customer.orders
                      .reduce((sum, order) => sum + order.grandtotal, 0)
                      .toLocaleString('en-IN')}
                  </h1>
                  <p
                    className={`text-xs uppercase tracking-wide ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Total Spent
                  </p>
                </div>
              </div>
              <div
                className={`rounded-lg overflow-y-auto max-h-[160px] ${
                  theme === 'dark'
                    ? 'bg-gray-700 scrollbar-dark'
                    : 'bg-gray-50 scrollbar-light'
                }`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor:
                    theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
                }}
              >
                <table className="w-full text-sm border-collapse">
                  <thead
                    className={`${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                    } sticky top-0 text-xs uppercase tracking-wide ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <tr className="h-10">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order, idx) => (
                      <tr
                        key={`${customer._id}-order-${
                          order.id || order._id || idx
                        }`}
                        className={`h-10 ${
                          theme === 'dark'
                            ? idx % 2 === 0
                              ? 'bg-gray-700'
                              : 'bg-gray-600'
                            : idx % 2 === 0
                            ? 'bg-gray-50'
                            : 'bg-white'
                        } hover:${
                          theme === 'dark' ? 'bg-gray-500' : 'bg-gray-100'
                        } transition-colors duration-200`}
                      >
                        <td className="p-3 flex items-center">
                          <Calendar
                            className={`w-4 h-4 mr-2 ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-600'
                            }`}
                          />
                          {new Date(order.createdat).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }
                          )}
                        </td>
                        <td
                          className={`p-3 text-right ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}
                        >
                          ₹{order.grandtotal.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-center">
                          <a
                            href={order.invoicepdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              theme === 'dark'
                                ? 'text-blue-400 hover:text-blue-300'
                                : 'text-blue-600 hover:text-blue-800'
                            } font-medium underline transition-colors duration-200`}
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
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
    </>
  );
};

export default HistoryCard;
