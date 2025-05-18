import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import EditModal from '../../components/EditModal';
import CreateSubAdminModal from '../../components/CreateSubAdminModal';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  Edit3,
  Users,
  Building,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  PlusCircle
} from 'lucide-react';

const SubAdminManagement = () => {
  const { theme } = useTheme();
  const [subAdmins, setSubAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editType, setEditType] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [companyStatusVersion, setCompanyStatusVersion] = useState(0);

  const fetchSubAdmins = async () => {
    try {
      const token = localStorage.getItem('cracker_token');
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/user/sub-admins`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSubAdmins(response.data);
      const query = searchQuery.toLowerCase();
      if (query) {
        setFilteredAdmins(
          response.data.filter(
            (admin) =>
              admin.name.toLowerCase().includes(query) ||
              admin.email.toLowerCase().includes(query) ||
              admin.companyId?.companyname?.toLowerCase().includes(query)
          )
        );
      } else {
        setFilteredAdmins(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sub-admins');
      setSubAdmins([]);
      setFilteredAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle status
  const toggleStatus = async (id, type, currentStatus) => {
    const token = localStorage.getItem('cracker_token');
    try {
      const payload =
        type === 'subadmin'
          ? { status: !currentStatus }
          : { companyStatus: !currentStatus }; // companyStatus will be handled by backend if id is for a user with company

      // Superadmin updates a subadmin or their company status
      await axios.put(
        `${import.meta.env.VITE_BASEURL}/user/update-subadmin`, // Changed from /userAuth to /user
        { id, ...payload }, // Pass the subadmin's id
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      let companyStatusActuallyChanged = false;
      const updatedAdmins = subAdmins.map((admin) => {
        if (admin._id === id) {
          const newAdminData = { ...admin };
          if (type === 'subadmin') {
            newAdminData.status = !currentStatus;
          } else if (type === 'company' && newAdminData.companyId) {
            if (newAdminData.companyId.status !== !currentStatus) {
              companyStatusActuallyChanged = true;
            }
            newAdminData.companyId = {
              ...newAdminData.companyId,
              status: !currentStatus
            };
          }
          return newAdminData;
        }
        return admin;
      });
      setSubAdmins(updatedAdmins);
      const currentQuery = searchQuery.toLowerCase();
      setFilteredAdmins(
        updatedAdmins.filter(
          (admin) =>
            admin.name.toLowerCase().includes(currentQuery) ||
            admin.email.toLowerCase().includes(currentQuery) ||
            admin.companyId?.companyname?.toLowerCase().includes(currentQuery)
        )
      );

      if (type === 'company' && companyStatusActuallyChanged) {
        setCompanyStatusVersion((prev) => prev + 1); // Trigger re-fetch
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Search filter
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = subAdmins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.companyId?.companyname?.toLowerCase().includes(query)
    );
    setFilteredAdmins(filtered);
  };

  // Open edit modal
  const openEdit = (admin, type) => {
    setSelectedAdmin(admin);
    setEditType(type);
  };

  // Close edit modal
  const closeEdit = () => {
    setSelectedAdmin(null);
    setEditType(null);
  };

  // Handle update
  const handleUpdate = (updatedAdminData) => {
    const updatedAdmins = subAdmins.map((admin) => {
      if (admin._id === (updatedAdminData._id || updatedAdminData.id)) {
        if (
          updatedAdminData.companyId &&
          typeof updatedAdminData.companyId === 'object'
        ) {
          return {
            ...admin,
            companyId: { ...admin.companyId, ...updatedAdminData.companyId }
          };
        } else {
          return { ...admin, ...updatedAdminData };
        }
      }
      return admin;
    });
    setSubAdmins(updatedAdmins);
    const query = searchQuery.toLowerCase();
    setFilteredAdmins(
      updatedAdmins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query) ||
          admin.companyId?.companyname?.toLowerCase().includes(query)
      )
    );
  };

  // Handle create sub-admin
  const handleCreate = (newAdmin) => {
    const updatedAdmins = [...subAdmins, newAdmin];
    setSubAdmins(updatedAdmins);
    setFilteredAdmins(updatedAdmins);
  };

  useEffect(() => {
    fetchSubAdmins();
  }, [companyStatusVersion]); // Added companyStatusVersion as dependency

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900 text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[300px] max-w-[600px]">
          <div
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, email, or company..."
            className={`w-full p-3 pl-10 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500'
            }`}
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition duration-200 whitespace-nowrap ${
            theme === 'dark'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <PlusCircle size={16} className="mr-1.5" /> Create New Sub-Admin
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
            }`}
          ></div>
          <span className="ml-3 text-lg">Loading Sub-Admins...</span>
        </div>
      )}
      {error && (
        <div
          className={`text-center py-10 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-red-900 text-red-300'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <AlertCircle size={24} className="mx-auto mb-2" />
          <p className="text-lg font-medium">Error Fetching Data</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div
          className={`shadow-xl rounded-xl overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead
                className={`${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <Users size={16} className="inline mr-1" /> Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <Building size={16} className="inline mr-1" /> Company
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider">
                    User Status
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider">
                    Company Status
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${
                  theme === 'dark'
                    ? 'divide-y divide-gray-700'
                    : 'divide-y divide-gray-200'
                }`}
              >
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin._id}
                    className={`transition duration-200 ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-medium">{admin.name}</div>
                      <div
                        className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {admin.phoneNumber || 'No phone'}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {admin.email}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {admin.companyId?.companyname || (
                        <span
                          className={`${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() =>
                          toggleStatus(admin._id, 'subadmin', admin.status)
                        }
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          admin.status
                            ? theme === 'dark'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-green-500 hover:bg-green-600'
                            : theme === 'dark'
                            ? 'bg-gray-600 hover:bg-gray-500'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={
                          admin.status ? 'Deactivate User' : 'Activate User'
                        }
                      >
                        {admin.status ? (
                          <ToggleRight size={24} className="text-white" />
                        ) : (
                          <ToggleLeft
                            size={24}
                            className={`${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            }`}
                          />
                        )}
                      </button>
                      <span
                        className={`ml-2 text-xs font-medium ${
                          admin.status
                            ? theme === 'dark'
                              ? 'text-green-400'
                              : 'text-green-700'
                            : theme === 'dark'
                            ? 'text-red-400'
                            : 'text-red-600'
                        }`}
                      >
                        {admin.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {admin.companyId ? (
                        <>
                          <button
                            onClick={() =>
                              toggleStatus(
                                admin._id,
                                'company',
                                admin.companyId?.status
                              )
                            }
                            className={`p-2 rounded-full transition-colors duration-200 ${
                              admin.companyId?.status
                                ? theme === 'dark'
                                  ? 'bg-purple-500 hover:bg-purple-600'
                                  : 'bg-purple-500 hover:bg-purple-600'
                                : theme === 'dark'
                                ? 'bg-gray-600 hover:bg-gray-500'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            title={
                              admin.companyId?.status
                                ? 'Deactivate Company'
                                : 'Activate Company'
                            }
                          >
                            {admin.companyId?.status ? (
                              <ToggleRight size={24} className="text-white" />
                            ) : (
                              <ToggleLeft
                                size={24}
                                className={`${
                                  theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              />
                            )}
                          </button>
                          <span
                            className={`ml-2 text-xs font-medium ${
                              admin.companyId?.status
                                ? theme === 'dark'
                                  ? 'text-purple-400'
                                  : 'text-purple-700'
                                : theme === 'dark'
                                ? 'text-red-400'
                                : 'text-red-600'
                            }`}
                          >
                            {admin.companyId?.status ? 'Active' : 'Inactive'}
                          </span>
                        </>
                      ) : (
                        <span
                          className={`${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(admin, 'user')}
                          className={`px-5 py-2 rounded-lg text-sm font-medium transition duration-300 transform hover:scale-105 shadow-md flex items-center justify-center ${
                            theme === 'dark'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                          title="Edit User Details"
                        >
                          <Edit3 size={16} className="mr-1.5" /> User
                        </button>
                        <button
                          onClick={() => openEdit(admin, 'company')}
                          disabled={!admin.companyId}
                          className={`px-5 py-2 rounded-lg text-sm font-medium transition duration-300 transform hover:scale-105 shadow-md flex items-center justify-center ${
                            theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
                          }`}
                          title="Edit Company Details"
                        >
                          <Building size={16} className="mr-1.5" /> Company
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAdmins.length === 0 && !loading && (
              <div
                className={`text-center py-10 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No Sub-Admins Found</p>
                <p className="text-sm">
                  {searchQuery
                    ? 'Try adjusting your search query.'
                    : 'There are no sub-admins to display.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedAdmin && editType && (
          <EditModal
            admin={selectedAdmin}
            type={editType}
            onClose={closeEdit}
            onUpdate={handleUpdate}
            onSuccess={fetchSubAdmins}
          />
        )}
        {isCreateModalOpen && (
          <CreateSubAdminModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubAdminManagement;
