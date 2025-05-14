import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, UserRound, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const CreateCustomer = ({ refreshCustomers, editData, onClose }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData._id,
        name: editData.name,
        phone: editData.phone,
        address: editData.address
      });
      setIsOpen(true);
    } else {
      setFormData({ name: '', phone: '', address: '' });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cracker_token');

    try {
      const endpoint = editData
        ? `${import.meta.env.VITE_BASEURL}/customer/`
        : `${import.meta.env.VITE_BASEURL}/customer/add`;

      const response = await axios[editData ? 'put' : 'post'](
        endpoint,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success(
          editData
            ? 'Customer updated successfully!'
            : 'Customer created successfully!'
        );
        refreshCustomers();
        handleClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to process customer'
      );
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-5 py-2.5 ${
          theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white rounded-lg transition-colors flex items-center gap-2`}
      >
        <UserRound className="w-5 h-5" />
        New Customer
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-md ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div
              className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } flex justify-between items-center`}
            >
              <h2
                className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                {editData ? 'Edit Customer' : 'New Customer'}
              </h2>
              <button
                onClick={handleClose}
                className={
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                }
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserRound
                    className={`w-5 h-5 absolute left-3 top-3 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 focus:ring-blue-500'
                    } focus:ring-2 focus:border-transparent`}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className={`w-5 h-5 absolute left-3 top-3 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 focus:ring-blue-500'
                    } focus:ring-2 focus:border-transparent`}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    className={`w-5 h-5 absolute left-3 top-3 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`}
                  />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 focus:ring-blue-500'
                    } focus:ring-2 focus:border-transparent h-24`}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-5 py-2.5 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editData ? 'Save' : 'Create'} Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCustomer;
