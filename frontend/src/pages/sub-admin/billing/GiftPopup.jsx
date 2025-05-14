import React from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../contexts/ThemeContext';
import { Package, X } from 'lucide-react';

const GiftPopup = ({
  fetchGiftData,
  SelectedGifts,
  setSelectedGifts,
  showPopup,
  setShowPopup,
  gifts
}) => {
  const { theme } = useTheme();

  const handleQuantityChange = (gift, delta) => {
    const existingGift = SelectedGifts.find((item) => item._id === gift._id);
    const currentQty = existingGift ? existingGift.quantity : 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty > gift.stockavailable) {
      toast.error(
        `Quantity exceeds the available stock of ${gift.stockavailable}`
      );
      return;
    }

    if (newQty === 0 && existingGift) {
      setSelectedGifts(SelectedGifts.filter((item) => item._id !== gift._id));
      return;
    }

    if (existingGift) {
      setSelectedGifts(
        SelectedGifts.map((item) =>
          item._id === gift._id ? { ...item, quantity: newQty } : item
        )
      );
    } else if (newQty > 0) {
      setSelectedGifts([...SelectedGifts, { ...gift, quantity: newQty }]);
    }
  };

  const handleQuantityInput = (gift, value) => {
    const numericValue = parseInt(value, 10);
    const newQty = isNaN(numericValue) ? 0 : Math.max(0, numericValue);

    if (newQty > gift.stockavailable) {
      toast.error(
        `Quantity exceeds the available stock of ${gift.stockavailable}`
      );
      return;
    }

    const existingGift = SelectedGifts.find((item) => item._id === gift._id);

    if (newQty === 0 && existingGift) {
      setSelectedGifts(SelectedGifts.filter((item) => item._id !== gift._id));
      return;
    }

    if (existingGift) {
      setSelectedGifts(
        SelectedGifts.map((item) =>
          item._id === gift._id ? { ...item, quantity: newQty } : item
        )
      );
    } else if (newQty > 0) {
      setSelectedGifts([...SelectedGifts, { ...gift, quantity: newQty }]);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={() => setShowPopup(false)}
      ></div>

      <div
        className={`relative w-[90%] max-w-4xl h-[85vh] rounded-xl shadow-lg p-6 flex flex-col ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            <Package size={24} />
            Select Gift Boxes
          </h2>
          <button
            onClick={() => setShowPopup(false)}
            className={`p-2 rounded-full ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`flex-1 overflow-x-auto overflow-y-auto ${
            theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor:
              theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
          }}
        >
          <table className="w-full min-w-[800px] table-fixed">
            <thead
              className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              } sticky top-0 z-10`}
            >
              <tr>
                <th
                  className={`p-3 text-left ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  } w-[35%]`}
                >
                  Gift Box
                </th>
                <th
                  className={`p-3 text-right ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  } w-[15%]`}
                >
                  Stock
                </th>
                <th
                  className={`p-3 text-right ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  } w-[15%]`}
                >
                  Price
                </th>
                <th
                  className={`p-3 text-center ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  } w-[20%]`}
                >
                  Quantity
                </th>
                <th
                  className={`p-3 text-right ${
                    theme === 'dark' ? 'text-gray-200' : ''
                  } w-[15%]`}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {gifts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className={`p-8 text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <p className="text-lg font-medium">
                      No gift boxes available
                    </p>
                    <p className="mt-2">Please add gift boxes to proceed</p>
                  </td>
                </tr>
              ) : (
                gifts.map((gift) => {
                  const currentQty =
                    SelectedGifts.find((item) => item._id === gift._id)
                      ?.quantity || 0;

                  return (
                    <tr
                      key={gift._id}
                      className={`border-b transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'border-gray-700 hover:bg-gray-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${
                        currentQty > 0
                          ? theme === 'dark'
                            ? 'bg-gray-600'
                            : 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        } truncate`}
                      >
                        {gift.name}
                      </td>
                      <td
                        className={`p-3 text-right ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        }`}
                      >
                        {gift.stockavailable}
                      </td>
                      <td
                        className={`p-3 text-right ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        } truncate`}
                      >
                        ₹{gift.grandtotal}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(gift, -1)}
                            disabled={currentQty === 0}
                            className={`px-3 py-1 ${
                              theme === 'dark'
                                ? 'bg-red-900 text-red-200 hover:bg-red-800'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            } rounded ${
                              currentQty === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={currentQty}
                            onChange={(e) =>
                              handleQuantityInput(gift, e.target.value)
                            }
                            className={`w-16 p-1 border rounded text-center ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-gray-100'
                                : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500`}
                            min="0"
                            max={gift.stockavailable}
                          />
                          <button
                            onClick={() => handleQuantityChange(gift, 1)}
                            disabled={currentQty >= gift.stockavailable}
                            className={`px-3 py-1 ${
                              theme === 'dark'
                                ? 'bg-green-900 text-green-200 hover:bg-green-800'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            } rounded ${
                              currentQty >= gift.stockavailable
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td
                        className={`p-3 text-right ${
                          theme === 'dark' ? 'text-gray-200' : ''
                        } truncate`}
                      >
                        ₹{(gift.grandtotal * currentQty).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <style>
          {`
            .scrollbar-dark::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .scrollbar-dark::-webkit-scrollbar-track {
              background: #1F2937;
            }
            .scrollbar-dark::-webkit-scrollbar-thumb {
              background: #4B5563;
              border-radius: 4px;
            }
            .scrollbar-dark::-webkit-scrollbar-thumb:hover {
              background: #6B7280;
            }
            .scrollbar-light::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .scrollbar-light::-webkit-scrollbar-track {
              background: #FFFFFF;
            }
            .scrollbar-light::-webkit-scrollbar-thumb {
              background: #D1D5DB;
              border-radius: 4px;
            }
            .scrollbar-light::-webkit-scrollbar-thumb:hover {
              background: #B0B7C0;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default GiftPopup;
