import React from 'react';
import Products from './Products';
import { useTheme } from '../../../contexts/ThemeContext';

const EditPopup = ({ gift, onClose, onSaveSuccess }) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } p-6 rounded-xl w-[90%] max-w-6xl h-[90vh] flex flex-col shadow-xl`}
      >
        <div
          className={`flex justify-between items-center mb-4 pb-4 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } border-b`}
        >
          <h2
            className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            Edit Gift Package
          </h2>
          <button
            onClick={onClose}
            className={`${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            } text-3xl transition-colors`}
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Products
            giftData={gift}
            isEditing={true}
            onGiftOperationSuccess={onSaveSuccess} // Pass the callback here
          />
        </div>
      </div>
    </div>
  );
};

export default EditPopup;
