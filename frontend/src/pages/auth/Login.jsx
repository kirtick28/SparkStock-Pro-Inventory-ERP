import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowRight
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from '../../assets/images/LoginPageImage.png';
import { useTheme } from '../../contexts/ThemeContext';

const Login = () => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={50} fullScreen />
      </div>
    );
  }

  if (user) {
    const roleRoutes = {
      superadmin: '/super-admin/subadmins',
      subadmin: '/sub-admin/dashboard'
    };
    return (
      <Navigate
        to={roleRoutes[user.role] || '/super-admin/subadmins'}
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/auth/login`,
        formData
      );
      login(response.data.token, response.data.user);
      toast.success('Login successful!');
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
      className={`min-h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900'
          : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]'
              : 'bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_50%)]'
          }`}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div
          className={`w-full grid grid-cols-1 lg:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-gray-800/95 border border-gray-700/50 shadow-black/50'
              : 'bg-white/95 border border-gray-200/50 shadow-gray-900/10'
          }`}
        >
          {/* Left Side - Login Form */}
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
            <div className="w-full max-w-sm mx-auto">
              {/* Logo/Brand Section */}
              <div className="text-center mb-8 lg:mb-10">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-cyan-600 to-sky-700 shadow-lg shadow-cyan-500/25'
                      : 'bg-gradient-to-br from-cyan-400 to-sky-500 shadow-lg shadow-cyan-400/25'
                  }`}
                >
                  <FaLock className="text-2xl sm:text-3xl text-white" />
                </div>
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Welcome Back
                </h1>
                <p
                  className={`text-sm sm:text-base transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Sign in to your ERP dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <FaEnvelope size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      className={`w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:bg-gray-700'
                          : 'bg-cyan-50/50 border-cyan-200 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-cyan-50'
                      }`}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <FaLock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:bg-gray-700'
                          : 'bg-cyan-50/50 border-cyan-200 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-cyan-50'
                      }`}
                      value={formData.password}
                      onChange={handleChange}
                      disabled={formLoading}
                      required
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 hover:scale-110 ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={formLoading}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`group w-full py-3.5 sm:py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-700 hover:to-sky-800 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                      : 'bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-500 hover:to-sky-600 shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40'
                  }`}
                >
                  {formLoading ? (
                    <Loader size={24} className="text-white" />
                  ) : (
                    <>
                      <span className="text-base sm:text-lg">Sign In</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>

                {/* Support Text */}
                <div className="text-center pt-4">
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Need access?{' '}
                    <a
                      href="mailto:superadmin@crackers.com"
                      className={`font-semibold transition-all duration-300 hover:underline ${
                        theme === 'dark'
                          ? 'text-cyan-400 hover:text-cyan-300'
                          : 'text-cyan-600 hover:text-cyan-700'
                      }`}
                    >
                      Contact Administrator
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Image/Info Section */}
          <div
            className={`relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600'
            }`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 min-h-[400px] lg:min-h-[600px]">
              {/* Content */}
              <div className="max-w-md mx-auto">
                <div className="mb-8 lg:mb-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">
                    Streamline Your Business Operations
                  </h2>
                  <p className="text-lg lg:text-xl text-blue-100 leading-relaxed">
                    Manage inventory, generate invoices, and track sales with
                    our comprehensive ERP solution.
                  </p>
                </div>

                {/* Image Container */}
                <div className="relative mb-8 lg:mb-10">
                  <div className="relative mx-auto w-64 sm:w-80 lg:w-96">
                    <img
                      src={loginImage}
                      alt="Business Management"
                      className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-300 rounded-full animate-pulse opacity-80" />
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-sky-300 rounded-full animate-pulse opacity-80" />
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { name: 'Inventory Management', icon: '📦' },
                    { name: 'Invoice Generation', icon: '🧾' },
                    { name: 'Sales Analytics', icon: '📊' },
                    { name: 'Customer Management', icon: '👥' }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:scale-105"
                    >
                      <span>{feature.icon}</span>
                      <span className="hidden sm:inline">{feature.name}</span>
                      <span className="sm:hidden">
                        {feature.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full opacity-50" />
              <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white/20 rounded-full opacity-50" />
              <div className="absolute top-1/3 right-8 w-12 h-12 border-2 border-white/20 rounded-full opacity-30" />
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        theme={theme}
        className="z-50"
        toastClassName={() =>
          `relative flex p-4 min-h-10 rounded-xl justify-between overflow-hidden cursor-pointer my-2 mx-2 shadow-lg ${
            theme === 'dark'
              ? 'bg-gray-800 text-white border border-gray-700'
              : 'bg-white text-gray-800 border border-gray-200'
          }`
        }
      />
    </div>
  );
};

export default Login;
