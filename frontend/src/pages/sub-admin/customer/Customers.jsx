import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CustomerCard from '../../../components/CustomerCard';
import CreateCustomer from './Popup';
import { useTheme } from '../../../contexts/ThemeContext';
import Loader from '../../../components/common/Loader';

const Customers = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState(null);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/customer/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTermLower) ||
      customer.phone.toLowerCase().includes(searchTermLower);
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && customer.status) ||
      (statusFilter === 'inactive' && !customer.status);
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (customer) => {
    setEditCustomer(customer);
  };

  const handleCloseModal = () => {
    setEditCustomer(null);
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      } `}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search customers..."
            className={`flex-1 p-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } focus:border-transparent shadow-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className={`p-3 pl-4 pr-8 rounded-lg border appearance-none ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <CreateCustomer
            refreshCustomers={fetchCustomers}
            editData={editCustomer}
            onClose={handleCloseModal}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size={60} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="group relative">
                  <CustomerCard
                    customer={customer}
                    onEdit={handleEdit}
                    refreshCustomers={fetchCustomers}
                  />
                  <Link
                    to={`/sub-admin/billing/${customer._id}/${customer.name}`}
                    className={`absolute bottom-6 right-6 inline-flex items-center px-4 py-2 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-lg transition-colors shadow-md`}
                  >
                    Create Bill
                  </Link>
                </div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div
                className={`text-center py-12 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                } rounded-xl border border-dashed`}
              >
                <p
                  className={
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }
                >
                  No customers found matching your criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
          select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${
              theme === 'dark' ? '9CA3AF' : '4B5563'
            }' class='w-5 h-5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.25em;
          }
        `}
      </style>
    </div>
  );
};

export default Customers;
