import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaMoon, FaSun, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import Logo from '../../assets/images/Logo.png';

const SharedHeader = ({
  showNavigation = false,
  navigationItems = [],
  showLoginButton = false,
  handleNavClick = null,
  className = '',
  variant = 'default'
}) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const logoVariants = {
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    }
  };

  const getHeaderClasses = () => {
    const baseClasses = 'relative z-20 w-full transition-all duration-500';

    switch (variant) {
      case 'landing':
        return `${baseClasses} backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 sticky top-0 border-b border-gray-200/60 dark:border-gray-800/60 shadow-lg shadow-gray-900/5 dark:shadow-black/20`;
      case 'transparent':
        return `${baseClasses} absolute top-0 left-0 right-0 z-30 bg-transparent`;
      default:
        return `${baseClasses} p-4 sm:p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm`;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`${getHeaderClasses()} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo Section */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (variant === 'landing') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
          >
            <motion.div variants={logoVariants} className="relative">
              <motion.div
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30'
                    : 'bg-gradient-to-br from-cyan-400/20 to-sky-500/20 group-hover:from-cyan-400/30 group-hover:to-sky-500/30'
                }`}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
              <img
                src={Logo}
                alt="SparkPro Logo"
                className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg object-cover border-2 border-white/50 dark:border-gray-700/50"
              />
              <motion.div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                  theme === 'dark' ? 'bg-blue-500' : 'bg-cyan-500'
                }`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col">
              <span
                className={`text-lg sm:text-xl font-extrabold tracking-wider transition-colors duration-300 bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === 'dark'
                    ? 'from-white via-blue-200 to-blue-300'
                    : 'from-gray-900 via-cyan-700 to-sky-600'
                }`}
              >
                SparkPro
              </span>
              {variant !== 'landing' && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={`text-xs sm:text-sm transition-colors duration-300 font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Inventory & Billing ERP
                </motion.span>
              )}
            </motion.div>
          </motion.div>

          {/* Navigation Items */}
          {showNavigation && navigationItems.length > 0 && (
            <motion.nav
              variants={itemVariants}
              className="hidden md:flex items-center gap-8 text-base"
            >
              {navigationItems.map((item, index) => (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    transition: { type: 'spring', stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick && handleNavClick(item.id)}
                  className={`relative font-semibold transition-all duration-300 px-3 py-2 rounded-lg group ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <motion.div
                    className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                        : 'bg-gradient-to-r from-cyan-400/10 to-sky-500/10'
                    }`}
                    layoutId="nav-hover"
                  />
                </motion.button>
              ))}
            </motion.nav>
          )}
        </div>

        {/* Right Side Actions */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {showNavigation && navigationItems.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700'
                  : 'bg-white/50 hover:bg-white/80 text-gray-600 border border-gray-200 backdrop-blur-sm'
              }`}
              aria-label="Toggle mobile menu"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <FaBars className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.div>
            </motion.button>
          )}

          {/* Home Button for non-landing variants */}
          {variant !== 'landing' && (
            <motion.button
              variants={itemVariants}
              whileHover={{
                scale: 1.1,
                rotate: 15,
                transition: { type: 'spring', stiffness: 400 }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600'
                  : 'bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 backdrop-blur-sm'
              }`}
              title="Go to homepage"
              aria-label="Go to homepage"
            >
              <FaHome className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300" />
            </motion.button>
          )}

          {/* Theme Toggle */}
          <motion.button
            variants={itemVariants}
            whileHover={{
              scale: 1.1,
              rotate: theme === 'dark' ? 180 : -180,
              transition: { type: 'spring', stiffness: 300 }
            }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`relative p-2 sm:p-3 rounded-xl transition-all duration-300 group overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-yellow-400 hover:text-yellow-300 border border-gray-700 hover:border-gray-600 shadow-lg shadow-yellow-400/10'
                : 'bg-white/50 hover:bg-white/80 text-orange-500 hover:text-orange-600 border border-gray-200 hover:border-gray-300 backdrop-blur-sm shadow-lg shadow-orange-500/10'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-all duration-700" />
            <motion.div
              animate={{ rotate: theme === 'dark' ? 0 : 360 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {theme === 'dark' ? (
                <FaSun className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              ) : (
                <FaMoon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              )}
            </motion.div>
          </motion.button>

          {/* Login Button */}
          {showLoginButton && (
            <motion.button
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -2,
                transition: { type: 'spring', stiffness: 400 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base border-2 transition-all duration-300 group overflow-hidden ${
                theme === 'dark'
                  ? 'border-blue-500 text-blue-400 hover:text-white shadow-lg shadow-blue-500/20'
                  : 'border-cyan-500 text-cyan-600 hover:text-white shadow-lg shadow-cyan-500/20'
              }`}
            >
              <motion.div
                className={`absolute inset-0 transition-all duration-300 transform origin-left scale-x-0 group-hover:scale-x-100 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-cyan-500 to-sky-600'
                }`}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
              <span className="relative z-10">Login</span>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Mobile Navigation Menu */}
      {showNavigation && navigationItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`md:hidden overflow-hidden border-t ${
            theme === 'dark'
              ? 'border-gray-700 bg-gray-800/95'
              : 'border-gray-200 bg-white/95'
          } backdrop-blur-lg`}
        >
          <motion.nav
            className="px-4 py-4 space-y-2"
            variants={{
              open: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 }
              },
              closed: {
                transition: { staggerChildren: 0.05, staggerDirection: -1 }
              }
            }}
            animate={isMobileMenuOpen ? 'open' : 'closed'}
          >
            {navigationItems.map((item, index) => (
              <motion.button
                key={index}
                variants={{
                  open: { opacity: 1, x: 0 },
                  closed: { opacity: 0, x: -20 }
                }}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // Small delay to ensure menu closes before scrolling
                  setTimeout(() => {
                    handleNavClick && handleNavClick(item.id);
                  }, 50);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default SharedHeader;
