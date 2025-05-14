import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';

const BaseLayout = ({ role }) => {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 ml-64">
        <Header role={role} />
        <main
          className={`p-6 ${
            theme === 'dark'
              ? 'bg-gray-900 text-gray-100'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <Outlet />
        </main>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default React.memo(BaseLayout);
