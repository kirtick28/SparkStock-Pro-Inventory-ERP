import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Package } from 'lucide-react';
import EditPopup from './EditPopup';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const GiftBoxes = ({ onGiftOperationSuccess }) => {
  const { theme } = useTheme();
  const [giftBoxes, setGiftBoxes] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);

  const fetchGiftBoxes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      setGiftBoxes(response.data);
    } catch (error) {
      toast.error('Failed to load gift boxes');
    }
  };

  const handleStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        { _id: id, status: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      fetchGiftBoxes();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchGiftBoxes();
  }, []); // This will run when the component mounts (or re-mounts due to key change)

  return (
    <div className="mt-8">
      <h1
        className={`text-2xl font-bold mb-6 ${
          theme === 'dark' ? 'text-gray-100' : ''
        }`}
      >
        Gift Packages
      </h1>
      {giftBoxes.length === 0 ? (
        <div
          className={`text-center p-8 rounded-xl border-2 ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700 text-gray-300'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No gift boxes available</p>
          <p className="mt-2">Create your first gift box to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giftBoxes.map((gift) => (
            <div
              key={gift._id}
              className={`p-6 rounded-xl border-2 transform transition-all duration-300 ease-in-out hover:-translate-y-1 ${
                theme === 'dark'
                  ? gift.status
                    ? 'bg-green-900/30 border-green-700 shadow-lg shadow-green-900/20 hover:shadow-xl hover:shadow-green-900/30'
                    : 'bg-red-900/30 border-red-700 shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30'
                  : gift.status
                  ? 'bg-green-50 border-green-600 shadow-lg shadow-green-100/50 hover:shadow-xl hover:shadow-green-200/50'
                  : 'bg-red-50 border-red-500 shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-200/50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3
                    className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-gray-100' : ''
                    }`}
                  >
                    {gift.name}
                  </h3>
                  <div
                    className={`flex items-center mt-2 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    <span>Stock: {gift.stockavailable}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGift(gift)}
                    className={`p-2 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleStatus(gift._id, gift.status)}
                    className={`p-2 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                        : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : ''
                  }`}
                >
                  Total Sales:
                </span>
                <span
                  className={`font-medium ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  }`}
                >
                  ₹{gift.grandtotal?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedGift && (
        <EditPopup
          gift={selectedGift}
          onClose={() => setSelectedGift(null)}
          onSaveSuccess={() => {
            setSelectedGift(null); // Close the popup
            if (onGiftOperationSuccess) {
              onGiftOperationSuccess(); // Trigger refresh in GiftIndex
            }
          }}
        />
      )}
    </div>
  );
};

export default GiftBoxes;
