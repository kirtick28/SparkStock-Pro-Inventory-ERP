import { Phone, CalendarDays, MapPin, Edit } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CustomerCard({ customer, onEdit, refreshCustomers }) {
  const { theme } = useTheme();
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium'
    }).format(new Date(dateString));
  };

  const handleStatusToggle = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      await axios.put(
        `${import.meta.env.VITE_BASEURL}/customer/`,
        {
          id: customer._id,
          status: !customer.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshCustomers();
      toast.success(
        `Customer status changed to ${!customer.status ? 'active' : 'inactive'}`
      );
    } catch (error) {
      toast.error('Failed to update customer status');
    }
  };

  return (
    <div
      className={`rounded-xl p-6 shadow-sm border transition-shadow ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700/50'
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          {customer.name}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(customer)}
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Edit
              className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              size={18}
            />
          </button>
          <button
            onClick={handleStatusToggle}
            className={`px-2.5 py-1 rounded-full text-sm font-medium cursor-pointer ${
              customer.status
                ? theme === 'dark'
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-green-100 text-green-700'
                : theme === 'dark'
                ? 'bg-red-900/50 text-red-400'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {customer.status ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div
          className={`flex items-start ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <MapPin
            className={`w-5 h-5 mt-0.5 mr-2 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          />
          <span className="text-sm">{customer.address}</span>
        </div>

        <div
          className={`flex items-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <Phone
            className={`w-5 h-5 mr-2 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          />
          <span className="text-sm">{customer.phone}</span>
        </div>

        <div
          className={`flex items-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <CalendarDays
            className={`w-5 h-5 mr-2 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          />
          <span className="text-sm">
            Joined {formatDate(customer.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
