import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from '../../assets/images/login-image.webp';
import { useTheme } from '../../contexts/ThemeContext'; // Added import

const Login = () => {
  const { theme } = useTheme(); // Added theme hook
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Immediate redirect if already logged in
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={50} fullScreen />
      </div>
    );
  }

  if (user) {
    const roleRoutes = {
      superadmin: '/super-admin/subadmins', // Changed from '/super-admin/dashboard'
      subadmin: '/sub-admin/dashboard'
    };
    return (
      <Navigate
        to={roleRoutes[user.role] || '/super-admin/subadmins'} // Default to subadmins for superadmin if role is somehow not in roleRoutes
        replace
      />
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/auth/login`, // Changed from /userAuth to /auth
        formData
      );
      login(response.data.token, response.data.user); // Pass user data to login context
      toast.success('Login successful!');
      // Immediate navigation handled by auth context
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Invalid email or password!');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      <div
        className={`w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden h-[90vh] max-h-[800px] ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Left Side - Login Form */}
        <div className="p-8 lg:p-12 flex items-center">
          <div className="w-full">
            <div className="mb-8 text-center lg:text-left">
              <h1
                className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Welcome to Crackers ERP
              </h1>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } mt-2`}
              >
                Your complete business management solution
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className={`w-full mt-2 px-4 py-3 rounded-lg border transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500'
                      : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500'
                        : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400'
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={formLoading}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className={`w-full text-white py-3 rounded-lg font-semibold transition duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-[#42aaff] hover:bg-[#296ba0]'
                }`}
              >
                {formLoading ? (
                  <Loader size={24} className="mx-auto" />
                ) : (
                  'Login'
                )}
              </button>

              <p
                className={`text-center ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Don't have an account?{' '}
                <a
                  href="mailto:superadmin@crackers.com"
                  className={`font-medium ${
                    theme === 'dark'
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  Contact Super Admin
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image Section */}
        <div className="hidden lg:block p-12 relative bg-[rgba(161,209,248,255)]">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Streamline Your Business
              </h2>
              <p className="text-lg opacity-90 max-w-md text-gray-700">
                Manage your inventory, track sales, and grow your business with
                our comprehensive ERP solution
              </p>
            </div>
            <img
              src={loginImage}
              alt="Login"
              className="w-full max-w-md object-contain h-[400px]"
            />
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" theme={theme} />
    </div>
  );
};

export default Login;
