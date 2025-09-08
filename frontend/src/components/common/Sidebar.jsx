import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Package,
  Gift,
  History,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const roleConfig = {
  superadmin: [
    {
      name: 'Sub Admin Management',
      path: '/super-admin/subadmins',
      icon: Users
    }
  ],
  subadmin: [
    { name: 'Dashboard', path: '/sub-admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/sub-admin/inventory', icon: Package },
    { name: 'Gift Boxes', path: '/sub-admin/gifts', icon: Gift },
    { name: 'Customers', path: '/sub-admin/customers', icon: Users },
    { name: 'Purchase History', path: '/sub-admin/history', icon: History }
  ]
};

const Sidebar = ({ role, isOpen, isMobile, isVisible = true }) => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navItems = [...(roleConfig[role] || [])];
  const toNav = role === 'superadmin' ? 'super-admin' : 'sub-admin';

  const sidebarVariants = {
    open: {
      width: isMobile ? '16rem' : '16rem',
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    closed: {
      width: isMobile ? '16rem' : '5rem',
      x: isMobile ? '-100%' : 0,
      opacity: isMobile ? 0 : 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    hidden: {
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const contentVariants = {
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.1,
        duration: 0.2
      }
    },
    closed: {
      opacity: isMobile ? 0 : 0,
      scale: isMobile ? 0.95 : 1,
      transition: {
        duration: 0.1
      }
    }
  };

  // Determine animation state
  const getAnimationState = () => {
    if (!isVisible) return 'hidden';
    return isOpen ? 'open' : 'closed';
  };

  // Show content based on state
  const shouldShowContent = () => {
    if (isMobile) return isOpen && isVisible;
    return isVisible; // On desktop, always show content when visible
  };

  return (
    <motion.aside
      initial="closed"
      animate={getAnimationState()}
      variants={sidebarVariants}
      className={`fixed top-0 left-0 h-full z-50 ${
        theme === 'dark'
          ? 'bg-gray-900/95 border-gray-700'
          : 'bg-white/95 border-gray-200'
      } border-r backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden ${
        isMobile ? 'w-64' : ''
      } ${!isVisible ? 'pointer-events-none' : ''}`}
      style={{
        visibility: isVisible || !isMobile ? 'visible' : 'hidden'
      }}
    >
      {/* Logo Section */}
      <div
        className={`${
          isOpen || isMobile ? 'p-6' : 'p-4'
        } border-b border-gray-200 dark:border-gray-700 transition-all duration-300`}
      >
        <div
          className={`flex items-center ${
            shouldShowContent() && isOpen ? 'gap-3' : 'justify-center'
          }`}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0"
          >
            <div
              className={`${
                shouldShowContent() && isOpen ? 'w-10 h-10' : 'w-8 h-8'
              } rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center ${
                theme === 'dark' ? 'shadow-blue-500/25' : 'shadow-blue-500/25'
              } shadow-lg transition-all duration-300`}
            >
              <Zap
                className="text-white"
                size={shouldShowContent() && isOpen ? 20 : 16}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {shouldShowContent() && isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2
                  className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}
                >
                  SparkPro
                </h2>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Inventory System
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div
        className={`flex-1 ${
          isOpen && shouldShowContent() ? 'p-4' : 'p-2'
        } space-y-2 transition-all duration-300`}
      >
        {navItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: shouldShowContent() ? 1 : 0, y: 0 }}
            transition={{ delay: shouldShowContent() ? index * 0.1 : 0 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center ${
                  isOpen && shouldShowContent()
                    ? 'gap-3 px-3 py-3'
                    : 'justify-center px-2 py-4'
                } rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? `${
                        theme === 'dark'
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      } border shadow-sm`
                    : `${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } hover:scale-[1.02]`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Background gradient for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6
                      }}
                    />
                  )}

                  <div
                    className={`relative z-10 flex items-center ${
                      isOpen && shouldShowContent() ? 'gap-3' : 'justify-center'
                    } w-full`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      } transition-transform`}
                    >
                      <item.icon
                        size={isOpen && shouldShowContent() ? 20 : 22}
                      />
                    </div>

                    <AnimatePresence>
                      {isOpen && shouldShowContent() && (
                        <motion.span
                          variants={contentVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="font-medium text-sm whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {(!isOpen || !shouldShowContent()) && (
                      <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                        {item.name}
                      </div>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>

      {/* Bottom Section */}
      <div
        className={`${
          isOpen && shouldShowContent() ? 'p-4' : 'p-2'
        } border-t border-gray-200 dark:border-gray-700 space-y-2 transition-all duration-300`}
      >
        {/* Settings */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <NavLink
            to={`/${toNav}/settings`}
            className={({ isActive }) =>
              `group flex items-center ${
                isOpen && shouldShowContent()
                  ? 'gap-3 px-3 py-3'
                  : 'justify-center px-2 py-4'
              } rounded-xl transition-all duration-200 relative ${
                isActive
                  ? `${
                      theme === 'dark'
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                    } border border-blue-200 dark:border-blue-500/30`
                  : `${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
              }`
            }
          >
            <Settings
              size={isOpen && shouldShowContent() ? 20 : 22}
              className="flex-shrink-0"
            />
            <AnimatePresence>
              {isOpen && shouldShowContent() && (
                <motion.span
                  variants={contentVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="font-medium text-sm whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {(!isOpen || !shouldShowContent()) && (
              <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                Settings
              </div>
            )}
          </NavLink>
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className={`group flex items-center ${
            isOpen && shouldShowContent() ? 'gap-3' : 'justify-center'
          } w-full ${
            isOpen && shouldShowContent() ? 'px-3 py-3' : 'px-2 py-4'
          } rounded-xl transition-all duration-200 relative ${
            theme === 'dark'
              ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          <LogOut
            size={isOpen && shouldShowContent() ? 20 : 22}
            className="flex-shrink-0"
          />
          <AnimatePresence>
            {isOpen && shouldShowContent() && (
              <motion.span
                variants={contentVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="font-medium text-sm whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed state */}
          {(!isOpen || !shouldShowContent()) && (
            <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
              Sign Out
            </div>
          )}
        </motion.button>
      </div>

      {/* Collapse indicator for collapsed state - removed for cleaner look */}
    </motion.aside>
  );
};

export default Sidebar;
