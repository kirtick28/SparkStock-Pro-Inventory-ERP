import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';

const BaseLayout = ({ role }) => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // If switching from mobile to desktop, open sidebar
      if (wasMobile && !mobile) {
        setSidebarOpen(true);
      }
      // If switching from desktop to mobile, close sidebar
      else if (!wasMobile && mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <Sidebar role={role} isOpen={sidebarOpen} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          !isMobile && sidebarOpen
            ? 'ml-64'
            : !isMobile && !sidebarOpen
            ? 'ml-20'
            : 'ml-0' // On mobile, always ml-0
        }`}
      >
        {/* Header */}
        <Header
          role={role}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 p-4 lg:p-6 overflow-auto ${
            theme === 'dark'
              ? 'bg-gray-900/50 text-gray-100'
              : 'bg-white/30 text-gray-800'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <ToastContainer
        position="bottom-right"
        className="z-50"
        toastClassName={`${
          theme === 'dark' ? 'dark:bg-gray-800 dark:text-white' : ''
        }`}
      />
    </div>
  );
};

export default React.memo(BaseLayout);
