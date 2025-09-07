import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  Bell,
  Search
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ role, onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef();
  const notificationRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    const basePath = role === 'superadmin' ? '/super-admin' : '/sub-admin';

    const pageTitles = {
      [`${basePath}/dashboard`]: 'Dashboard',
      [`${basePath}/inventory`]: 'Inventory Management',
      [`${basePath}/settings`]: 'Settings',
      [`${basePath}/customers`]: 'Customer Management',
      [`${basePath}/gifts`]: 'Gift Box Management',
      [`${basePath}/history`]: 'Purchase History',
      [`${basePath}/subadmins`]: 'Sub Admin Management'
    };

    if (path.startsWith(`${basePath}/billing`)) {
      return 'Billing';
    }

    return pageTitles[path] || 'Dashboard';
  };

  const notifications = [
    {
      id: 1,
      message: 'Low stock alert for firecrackers',
      time: '2 min ago',
      type: 'warning'
    },
    { id: 2, message: 'New order received', time: '5 min ago', type: 'info' },
    {
      id: 3,
      message: 'System backup completed',
      time: '1 hour ago',
      type: 'success'
    }
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-30 backdrop-blur-lg border-b ${
        theme === 'dark'
          ? 'bg-gray-800/90 border-gray-700 shadow-lg shadow-gray-900/10'
          : 'bg-white/90 border-gray-200 shadow-lg shadow-blue-500/10'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
            }`}
          >
            <Menu size={20} />
          </motion.button>

          {/* Page Title */}
          <div className="hidden sm:block">
            <h1
              className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {getPageTitle()}
            </h1>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {user.companyName}
            </p>
          </div>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
            }`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              }`}
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-80 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-xl shadow-xl border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } py-2`}
                >
                  <div
                    className={`px-4 py-2 border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      Notifications
                    </h3>
                  </div>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{
                        backgroundColor:
                          theme === 'dark' ? '#374151' : '#f3f4f6'
                      }}
                      className={`px-4 py-3 ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      } cursor-pointer`}
                    >
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {notification.time}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-200 hover:text-white'
                  : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-medium text-sm">{user?.name}</p>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {role === 'superadmin' ? 'Super Admin' : 'Sub Admin'}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  showMenu ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-56 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-xl shadow-xl border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } py-2`}
                >
                  <motion.button
                    whileHover={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                    }}
                    onClick={() => {
                      setShowMenu(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${
                      theme === 'dark'
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <User size={16} />
                    Profile Settings
                  </motion.button>

                  <div
                    className={`my-1 border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  ></div>

                  <motion.button
                    whileHover={{
                      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2'
                    }}
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                    } transition-colors`}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
