import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader as LucideLoader } from 'lucide-react';
import Popup from './Popup';
import { useTheme } from '../../../contexts/ThemeContext';
import Loader from '../../../components/common/Loader';

function StockTable() {
  const { theme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editCracker, setEditCracker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 500) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Server error, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleUpdate = async (crackerId) => {
    const token = localStorage.getItem('cracker_token');
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASEURL}/product/update`,
        editCracker,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success('Product updated successfully!');
        getProducts();
        setEditCracker(null);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
        } else if (error.response.status === 404) {
          toast.error('Product not found');
        } else {
          toast.error('Server error, please try again');
        }
      } else {
        toast.error('Network error, please check your connection');
      }
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
            <div className="w-full lg:w-1/2">
              <input
                type="text"
                placeholder="Search products..."
                className={`w-full p-2.5 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-100'
                    : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto ml-auto">
              <button
                onClick={() => setShowAddModal(true)}
                className="whitespace-nowrap bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                + Add Product
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="whitespace-nowrap bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Import Data
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader size={50} />
            </div>
          ) : (
            <div
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-lg overflow-hidden`}
            >
              <div
                className={`overflow-x-auto h-[calc(100vh-220px)] overflow-y-auto ${
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
                    } sticky top-0`}
                  >
                    <tr>
                      {[
                        'Image',
                        'S.No',
                        'Name',
                        'Stock',
                        'Price',
                        'Total Sales',
                        'Total Revenue',
                        'Status',
                        'Actions'
                      ].map((header) => (
                        <th
                          key={header}
                          className={`px-6 py-4 text-left text-sm font-semibold ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                          } uppercase tracking-wider border-b ${
                            theme === 'dark'
                              ? 'border-gray-700'
                              : 'border-gray-200'
                          }`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                    }`}
                  >
                    {products
                      .filter((product) =>
                        product.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((product, index) => (
                        <tr
                          key={product._id}
                          className={`${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-900'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.image}
                          </td>
                          <td className="px-6 py-4">{index + 1}</td>
                          <td
                            className={`px-6 py-4 font-medium ${
                              theme === 'dark'
                                ? 'text-gray-200'
                                : 'text-gray-900'
                            }`}
                          >
                            {editCracker?._id === product._id ? (
                              <input
                                type="text"
                                name="name"
                                value={editCracker.name}
                                onChange={(e) =>
                                  setEditCracker({
                                    ...editCracker,
                                    name: e.target.value
                                  })
                                }
                                className={`w-full p-2 border rounded ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'border-gray-300'
                                }`}
                              />
                            ) : (
                              product.name
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editCracker?._id === product._id ? (
                              <input
                                type="number"
                                name="stockavailable"
                                value={editCracker.stockavailable}
                                onChange={(e) =>
                                  setEditCracker({
                                    ...editCracker,
                                    stockavailable: e.target.value
                                  })
                                }
                                className={`w-full p-2 border rounded ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'border-gray-300'
                                }`}
                              />
                            ) : (
                              product.stockavailable
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editCracker?._id === product._id ? (
                              <input
                                type="number"
                                name="price"
                                value={editCracker.price}
                                onChange={(e) =>
                                  setEditCracker({
                                    ...editCracker,
                                    price: e.target.value
                                  })
                                }
                                className={`w-full p-2 border rounded ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'border-gray-300'
                                }`}
                              />
                            ) : (
                              `₹${product.price}`
                            )}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            {product.totalsales}
                          </td>
                          <td className="px-6 py-4 font-semibold text-green-700">
                            ₹
                            {(
                              product.price * product.totalsales
                            ).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {editCracker?._id === product._id ? (
                              <select
                                value={editCracker.status}
                                onChange={(e) =>
                                  setEditCracker({
                                    ...editCracker,
                                    status: e.target.value
                                  })
                                }
                                className={`p-2 border rounded ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'border-gray-300'
                                }`}
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            ) : (
                              <span
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                  product.status
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}
                              >
                                {product.status ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editCracker?._id === product._id ? (
                              <button
                                onClick={() => handleUpdate(product._id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditCracker(product)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <Popup
          getProducts={getProducts}
          setShowModal={setShowAddModal}
          mode="add"
        />
      )}

      {/* Import Data Modal */}
      {showImportModal && (
        <Popup
          getProducts={getProducts}
          setShowModal={setShowImportModal}
          mode="import"
        />
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
}

export default StockTable;
