import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Package,
  FileText,
  Gift,
  History
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const roleConfig = {
  superadmin: [
    {
      name: 'Sub Admin Management',
      path: '/super-admin/subadmins',
      icon: LayoutDashboard
    }
  ],
  subadmin: [
    { name: 'Dashboard', path: '/sub-admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/sub-admin/inventory', icon: Package },
    { name: 'Gifts', path: '/sub-admin/gifts', icon: Gift },
    { name: 'Customers', path: '/sub-admin/customers', icon: Users },
    { name: 'Purchase History', path: '/sub-admin/history', icon: History }
  ]
};

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navItems = [...(roleConfig[role] || [])];
  const toNav = role === 'superadmin' ? 'super-admin' : 'sub-admin';
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed top-0 left-0 h-full w-64 ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } border-r shadow-lg p-6 flex flex-col`} // Added flex flex-col
    >
      <div>
        {' '}
        <div className="mb-8">
          <span
            className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Crackers ERP
          </span>
        </div>
        <div className="space-y-2">
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? `${
                          theme === 'dark'
                            ? 'bg-blue-900 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                        } font-medium`
                      : `${
                          theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        {' '}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mb-2" // Add some margin below settings
        >
          <NavLink
            to={`/${toNav}/settings`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? `${
                      theme === 'dark'
                        ? 'bg-blue-900 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                    } font-medium`
                  : `${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </motion.div>
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-4 py-3 ${
            theme === 'dark'
              ? 'text-red-400 hover:bg-red-900'
              : 'text-red-600 hover:bg-red-50'
          } rounded-lg transition-all`}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
