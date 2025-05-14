import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../contexts/ThemeContext';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';

function Settings() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/user/profile`, // Changed from /userAuth to /user
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetails({
        name: response.data.name || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching user details: ', error);
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateUserDetails = () => {
    if (!userDetails.name.trim()) {
      toast.error('User name is required');
      return false;
    }
    if (!userDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Invalid email address');
      return false;
    }
    if (userDetails.phoneNumber && !userDetails.phoneNumber.match(/^\d{10}$/)) {
      toast.error('Phone number must be 10 digits');
      return false;
    }
    if (userDetails.password && userDetails.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (userDetails.password !== userDetails.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserDetails()) return;
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const updateData = {
        name: userDetails.name,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber
      };
      if (userDetails.password) {
        updateData.password = userDetails.password;
      }
      // Superadmin updates their own profile
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/user`, // Changed from /userAuth/update to /user/update
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success('User details updated successfully!');
        // Assuming token might be refreshed
        if (response.data.token) {
          localStorage.setItem('cracker_token', response.data.token);
          // Optionally, update user context if you have one for superadmin details
        }
        fetchUserDetails(); // Re-fetch to display updated details
        setUserDetails((prev) => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating user details: ', error);
      toast.error('Failed to update user details'); // Corrected this line
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      } md:p-4`}
    >
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size={60} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl shadow-xl p-8 flex flex-col gap-12 scrollbar-${
              theme === 'dark' ? 'dark' : 'light'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor:
                theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
            }}
          >
            {/* User Details Section */}
            <div>
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                User Details
              </h2>
              <form
                onSubmit={handleUserSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userDetails.name}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={userDetails.phoneNumber}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={userDetails.password}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={userDetails.confirmPassword}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="md:col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                  >
                    Update User Details
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
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
            background: #F3F4F6;
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

export default Settings;
