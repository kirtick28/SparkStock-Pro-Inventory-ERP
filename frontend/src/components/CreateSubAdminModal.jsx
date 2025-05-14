import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { X, Save } from 'lucide-react';

const CreateSubAdminModal = ({ onClose, onCreate }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    useExistingCompany: false,
    companyId: '',
    companyname: '',
    companytagline: '',
    personcontact: '',
    shopaddress: '',
    jobdescription: '',
    bankdetails: {
      accountname: '',
      accountno: '',
      accounttype: '',
      bankname: '',
      branch: '',
      ifsc: ''
    }
  });
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('cracker_token');
        const response = await axios.get(
          `${import.meta.env.VITE_BASEURL}/company/dropdown`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCompanies(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch companies');
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name.includes('bankdetails.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        bankdetails: { ...prev.bankdetails, [field]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cracker_token');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        useExistingCompany: formData.useExistingCompany,
        companyId: formData.companyId,
        companyName: formData.companyname,
        companyTagline: formData.companytagline,
        personContact: formData.personcontact,
        shopAddress: formData.shopaddress,
        jobDescription: formData.jobdescription,
        bankDetails: formData.bankdetails
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/user/create-subadmin`, // Changed from /userAuth to /user
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onCreate(response.data.subAdmin);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sub-admin');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`relative w-full max-w-2xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] ${
            theme === 'dark'
              ? 'bg-gray-900 text-gray-100 scrollbar-dark'
              : 'bg-white text-gray-900 scrollbar-light'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor:
              theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
          }}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
          <h2
            className={`text-3xl font-semibold mb-6 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Create New Sub-Admin
          </h2>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-red-900/50 text-red-300'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: 'Name', name: 'name', type: 'text', required: true },
                {
                  label: 'Email',
                  name: 'email',
                  type: 'email',
                  required: true
                },
                {
                  label: 'Password',
                  name: 'password',
                  type: 'password',
                  required: true
                },
                { label: 'Phone Number', name: 'phoneNumber', type: 'text' }
              ].map((field) => (
                <div key={field.name}>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-500 placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500 placeholder-gray-400'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="useExistingCompany"
                checked={formData.useExistingCompany}
                onChange={handleChange}
                className={`h-5 w-5 rounded border focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-indigo-500 focus:ring-indigo-500'
                    : 'bg-gray-50 border-gray-300 text-indigo-500 focus:ring-indigo-500'
                }`}
              />
              <label
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Use Existing Company
              </label>
            </div>
            {formData.useExistingCompany ? (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Select Company
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500'
                  }`}
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.companyname}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: 'Company Name',
                      name: 'companyname',
                      required: true
                    },
                    { label: 'Tagline', name: 'companytagline' },
                    { label: 'Contact Person', name: 'personcontact' },
                    { label: 'Shop Address', name: 'shopaddress' }
                  ].map((field) => (
                    <div key={field.name}>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        className={`w-full p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-500 placeholder-gray-500'
                            : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Job Description
                  </label>
                  <textarea
                    name="jobdescription"
                    value={formData.jobdescription}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-500 placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500 placeholder-gray-400'
                    }`}
                    rows="4"
                  />
                </div>
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        label: 'Account Name',
                        name: 'bankdetails.accountname'
                      },
                      {
                        label: 'Account Number',
                        name: 'bankdetails.accountno'
                      },
                      {
                        label: 'Account Type',
                        name: 'bankdetails.accounttype'
                      },
                      { label: 'Bank Name', name: 'bankdetails.bankname' },
                      { label: 'Branch', name: 'bankdetails.branch' },
                      { label: 'IFSC', name: 'bankdetails.ifsc' }
                    ].map((field) => (
                      <div key={field.name}>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {field.label}
                        </label>
                        <input
                          type="text"
                          name={field.name}
                          value={formData.bankdetails[field.name.split('.')[1]]}
                          onChange={handleChange}
                          className={`w-full p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-500 placeholder-gray-500'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                <Save size={20} />
                Create Sub-Admin
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      {/* Add the style tag here for scrollbar styling */}
      <style>
        {`
          .scrollbar-dark::-webkit-scrollbar {
            width: 8px;
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
    </AnimatePresence>
  );
};

export default CreateSubAdminModal;
