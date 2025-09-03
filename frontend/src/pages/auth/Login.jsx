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
import { motion } from 'framer-motion';
import Loader from '../../components/common/Loader';
import SharedHeader from '../../components/common/SharedHeader';
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: 'easeOut'
      }
    }
  };

  const leftPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };

  const rightPanelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.15
      }
    }
  };

  const formElementVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen w-full flex flex-col transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900'
          : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50'
      }`}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20"
      >
        <SharedHeader variant="transparent" />
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`absolute inset-0 ${
              theme === 'dark'
                ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]'
                : 'bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_50%)]'
            }`}
          />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <motion.div
            variants={cardVariants}
            className={`w-full grid grid-cols-1 lg:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-gray-800/95 border border-gray-700/50 shadow-black/50'
                : 'bg-white/95 border border-gray-200/50 shadow-gray-900/10'
            }`}
          >
            <motion.div
              variants={leftPanelVariants}
              className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 flex items-center justify-center min-h-[500px]"
            >
              <div className="w-full max-w-sm mx-auto">
                <motion.div
                  variants={formElementVariants}
                  className="text-center mb-8 lg:mb-10"
                >
                  <motion.div
                    variants={formElementVariants}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-br from-cyan-400 to-sky-500 shadow-lg shadow-cyan-400/25'
                    }`}
                  >
                    <FaLock className="text-2xl sm:text-3xl text-white" />
                  </motion.div>
                  <motion.h1
                    variants={formElementVariants}
                    className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Welcome Back
                  </motion.h1>
                  <motion.p
                    variants={formElementVariants}
                    className={`text-sm sm:text-base transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Sign in to your ERP dashboard
                  </motion.p>
                </motion.div>

                <motion.form
                  variants={formElementVariants}
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Email Field */}
                  <motion.div variants={formElementVariants} className="group">
                    <motion.label
                      variants={formElementVariants}
                      className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Email Address
                    </motion.label>
                    <motion.div
                      variants={formElementVariants}
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
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
                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
                            : 'bg-cyan-50/50 border-cyan-200 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-cyan-50'
                        }`}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={formLoading}
                        required
                      />
                    </motion.div>
                  </motion.div>
                  <motion.div variants={formElementVariants} className="group">
                    <motion.label
                      variants={formElementVariants}
                      className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Password
                    </motion.label>
                    <motion.div
                      variants={formElementVariants}
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
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
                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
                            : 'bg-cyan-50/50 border-cyan-200 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-cyan-50'
                        }`}
                        value={formData.password}
                        onChange={handleChange}
                        disabled={formLoading}
                        required
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 ${
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
                      </motion.button>
                    </motion.div>
                  </motion.div>

                  {/* Login Button */}
                  <motion.button
                    variants={formElementVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={formLoading}
                    className={`group w-full py-3.5 sm:py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                        : 'bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-500 hover:to-sky-600 shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40'
                    }`}
                  >
                    {formLoading ? (
                      <Loader size={24} className="text-white" />
                    ) : (
                      <>
                        <span className="text-base sm:text-lg">Sign In</span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <FaArrowRight />
                        </motion.div>
                      </>
                    )}
                  </motion.button>

                  {/* Support Text */}
                  <motion.div
                    variants={formElementVariants}
                    className="text-center pt-4"
                  >
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Need access?{' '}
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        href="mailto:superadmin@crackers.com"
                        className={`font-semibold transition-all duration-300 hover:underline ${
                          theme === 'dark'
                            ? 'text-blue-400 hover:text-blue-300'
                            : 'text-cyan-600 hover:text-cyan-700'
                        }`}
                      >
                        Contact Administrator
                      </motion.a>
                    </p>
                  </motion.div>
                </motion.form>
              </div>
            </motion.div>

            {/* Right Side - Image/Info Section */}
            <motion.div
              variants={rightPanelVariants}
              className={`relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
                  : 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600'
              }`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0">
                <motion.div
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 0.2, scale: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                </motion.div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 min-h-[500px] py-12">
                {/* Content */}
                <div className="max-w-md mx-auto w-full">
                  <motion.div
                    variants={formElementVariants}
                    className="mb-6 lg:mb-8"
                  >
                    <motion.h2
                      variants={formElementVariants}
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6"
                    >
                      Streamline Your Business Operations
                    </motion.h2>
                    <motion.p
                      variants={formElementVariants}
                      className="text-lg lg:text-xl text-blue-100 leading-relaxed"
                    >
                      Manage inventory, generate invoices, and track sales with
                      our comprehensive ERP solution.
                    </motion.p>
                  </motion.div>

                  {/* Image Container */}
                  <motion.div
                    variants={formElementVariants}
                    className="relative mb-6 lg:mb-8"
                  >
                    <motion.div
                      variants={floatingVariants}
                      animate="float"
                      className="relative mx-auto w-48 sm:w-64 lg:w-80"
                    >
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        src={loginImage}
                        alt="Business Management"
                        className="w-full h-auto object-contain drop-shadow-2xl"
                      />
                      {/* Floating Elements */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-300 rounded-full"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.5
                        }}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-sky-300 rounded-full"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Feature Tags */}
                  <motion.div
                    variants={formElementVariants}
                    className="flex flex-wrap justify-center gap-2 mb-4"
                  >
                    {[
                      { name: 'Inventory Management', icon: '📦' },
                      { name: 'Invoice Generation', icon: '🧾' },
                      { name: 'Sales Analytics', icon: '📊' },
                      { name: 'Customer Management', icon: '👥' }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.8 + index * 0.1,
                          ease: 'easeOut'
                        }}
                        whileHover={{
                          scale: 1.05,
                          y: -2,
                          transition: { type: 'spring', stiffness: 400 }
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:bg-white/20 cursor-pointer"
                      >
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2
                          }}
                          className="text-xs"
                        >
                          {feature.icon}
                        </motion.span>
                        <span className="hidden sm:inline">{feature.name}</span>
                        <span className="sm:hidden">
                          {feature.name.split(' ')[0]}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Decorative Elements - Smaller and repositioned */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute top-8 left-8 w-12 h-12 border border-white/20 rounded-full opacity-30"
                />
                <motion.div
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute bottom-8 right-8 w-10 h-10 border border-white/20 rounded-full opacity-30"
                />
                <motion.div
                  animate={{
                    y: [-5, 5, -5],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute top-1/4 right-6 w-8 h-8 border border-white/20 rounded-full opacity-20"
                />
              </div>
            </motion.div>
          </motion.div>
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
    </motion.div>
  );
};

export default Login;
