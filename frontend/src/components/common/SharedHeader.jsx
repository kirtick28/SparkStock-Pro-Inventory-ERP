import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';
import Logo from '../../assets/images/Logo.png';

const SharedHeader = ({
  showNavigation = false,
  navigationItems = [],
  showLoginButton = false,
  handleNavClick = null,
  className = '',
  variant = 'default' // "default" | "transparent" | "landing"
}) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getHeaderClasses = () => {
    const baseClasses = 'relative z-20 w-full transition-all duration-500';

    switch (variant) {
      case 'landing':
        return `${baseClasses} backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 sticky top-0 border-b border-gray-200/80 dark:border-gray-800/80`;
      case 'transparent':
        return `${baseClasses} bg-transparent`;
      default:
        return `${baseClasses} p-4 sm:p-6`;
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`${getHeaderClasses()} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (variant === 'landing') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
          >
            <div className="relative">
              <img
                src={Logo}
                alt="SparkPro Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-lg sm:text-xl font-extrabold tracking-wider transition-colors duration-300 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                SparkPro
              </span>
              {variant !== 'landing' && (
                <span
                  className={`text-xs sm:text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Inventory & Billing ERP
                </span>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          {showNavigation && navigationItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-8 text-base">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick && handleNavClick(item.id)}
                  className={`font-medium transition-colors duration-300 hover:scale-105 ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              theme === 'dark'
                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-yellow-400 border border-gray-700'
                : 'bg-white/50 hover:bg-white/80 text-gray-600 border border-gray-200 backdrop-blur-sm'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FaSun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <FaMoon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Login Button */}
          {showLoginButton && (
            <button
              onClick={() => navigate('/login')}
              className={`px-4 sm:px-5 py-2 rounded-lg font-semibold border-2 transition-all duration-300 text-sm ${
                theme === 'dark'
                  ? 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
              }`}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default SharedHeader;
