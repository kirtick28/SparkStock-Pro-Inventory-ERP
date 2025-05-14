import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDown, LogOut, User, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ role }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
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
      [`${basePath}/gifts`]: 'Gift Box Management'
    };

    if (path.startsWith(`${basePath}/billing`)) {
      return 'Billing';
    }
    if (role === 'superadmin')
      return pageTitles[path] || 'Inventory Management';
    return ' - ' + pageTitles[path] || ' -Inventory Management';
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 shadow-md px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
          {user.companyName} {getPageTitle()}
        </h3>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-2 ${
                theme === 'dark'
                  ? 'text-gray-200 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0) || '?'}
              </div>
              <span className="font-medium">{user?.name}</span>
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-lg shadow-lg py-1`}
                >
                  <button
                    onClick={() => {
                      /* Navigate to profile */
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${
                      theme === 'dark'
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-gray-700'
                        : 'text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
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
