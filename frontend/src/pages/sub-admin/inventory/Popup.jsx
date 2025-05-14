import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../../contexts/ThemeContext';

const Popup = ({ getProducts, setShowModal, mode = 'add' }) => {
  const { theme } = useTheme();
  const [newProduct, setNewProduct] = useState({
    name: '',
    stockavailable: '',
    price: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddSubmit = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/product/add`,
        newProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Product added successfully!');
      getProducts();
      setShowModal(false);
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
        getProducts();
        setShowModal(false);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl w-full max-w-md`}
      >
        <div
          className={`p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h3
            className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            {mode === 'add' ? 'Add New Product' : 'Import Products'}
          </h3>
        </div>

        {mode === 'add' ? (
          <div className="p-6 space-y-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                } mb-1`}
              >
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className={`w-full p-3 border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                } mb-1`}
              >
                Stock Quantity
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
                className={`w-full p-3 border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                } mb-1`}
              >
                Price
              </label>
              <input
                type="number"
                placeholder="Enter price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className={`w-full p-3 border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-600'
                }`}
              >
                Please upload an Excel file (.xlsx) with the following columns:
              </p>
              <ul
                className={`list-disc pl-5 text-sm ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-600'
                } space-y-2`}
              >
                <li>
                  <code>name</code> (Product Name)
                </li>
                <li>
                  <code>price</code> (Product Price)
                </li>
                <li>
                  <code>stockavailable</code> (Stock Quantity)
                </li>
              </ul>
              <div className="mt-4">
                <label
                  className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  } mb-2`}
                >
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'add' ? handleAddSubmit : handleImportSubmit}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {mode === 'add' ? 'Add Product' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
