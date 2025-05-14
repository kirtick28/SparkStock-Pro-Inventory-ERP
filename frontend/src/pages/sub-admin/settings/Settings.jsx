import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../../contexts/ThemeContext';
import Loader from '../../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';

function Settings() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    companyTagline: '',
    shopAddress: '',
    personContact: '',
    contactEmail: '',
    contactPhone: '',
    gstNumber: '',
    paymentTerms: '',
    jobDescription: '',
    bankDetails: {
      accountName: '',
      accountNo: '',
      accountType: '',
      bankName: '',
      branch: '',
      ifsc: ''
    }
  });

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/user/profile`, // Changed from /userAuth to /user
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetails({
        name: response.data.name || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching user details: ', error);
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/company/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanyDetails({
        companyName: response.data.companyname || '',
        companyTagline: response.data.companytagline || '',
        shopAddress: response.data.shopaddress || '',
        personContact: response.data.personcontact || '',
        contactEmail: response.data.contactEmail || '',
        contactPhone: String(response.data.contactPhone || ''),
        gstNumber: response.data.gstNumber || '',
        paymentTerms: response.data.paymentterms || '',
        jobDescription: response.data.jobdescription || '',
        bankDetails: {
          accountName: response.data.bankdetails?.accountname || '',
          accountNo: response.data.bankdetails?.accountno || '',
          accountType: response.data.bankdetails?.accounttype || '',
          bankName: response.data.bankdetails?.bankname || '',
          branch: response.data.bankdetails?.branch || '',
          ifsc: response.data.bankdetails?.ifsc || ''
        }
      });
    } catch (error) {
      console.error('Error fetching company details: ', error);
      toast.error('Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchCompanyDetails();
  }, []);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setCompanyDetails((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value }
      }));
    } else {
      setCompanyDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateUserDetails = () => {
    if (!userDetails.name.trim()) {
      toast.error('User name is required');
      return false;
    }
    if (!userDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Invalid email address');
      return false;
    }
    if (userDetails.phoneNumber && !userDetails.phoneNumber.match(/^\d{10}$/)) {
      toast.error('Phone number must be 10 digits');
      return false;
    }
    if (userDetails.password && userDetails.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (userDetails.password !== userDetails.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateCompanyDetails = () => {
    if (!companyDetails.companyName.trim()) {
      toast.error('Company name is required');
      return false;
    }
    if (!companyDetails.shopAddress.trim()) {
      toast.error('Shop address is required');
      return false;
    }
    if (
      companyDetails.contactEmail &&
      !companyDetails.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      toast.error('Invalid company email address');
      return false;
    }
    if (
      companyDetails.contactPhone &&
      !companyDetails.contactPhone.match(/^\d{10}$/)
    ) {
      toast.error('Company phone number must be 10 digits');
      return false;
    }
    if (
      companyDetails.bankDetails.ifsc &&
      !companyDetails.bankDetails.ifsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    ) {
      toast.error('Invalid IFSC code');
      return false;
    }
    return true;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserDetails()) return;
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const updateData = {
        name: userDetails.name,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber
      };
      if (userDetails.password) {
        updateData.password = userDetails.password;
      }
      // Sub-admin updates their own profile, so the endpoint is /user (PUT)
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/user/update-subadmin`, // Changed from /userAuth/update to /user
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success('User details updated successfully!');
        // If token is refreshed upon profile update, update it
        if (response.data.token) {
          login(response.data.token, response.data.user); // Assuming login updates localStorage
        }
        fetchUserDetails(); // Re-fetch to confirm changes and get latest data
        setUserDetails((prev) => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating user details: ', error);
      toast.error('Failed to update user details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!validateCompanyDetails()) return;
    const token = localStorage.getItem('cracker_token');
    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/company`,
        {
          companyname: companyDetails.companyName,
          companytagline: companyDetails.companyTagline,
          shopaddress: companyDetails.shopAddress,
          personcontact: companyDetails.personContact,
          contactEmail: companyDetails.contactEmail,
          contactPhone: companyDetails.contactPhone,
          gstNumber: companyDetails.gstNumber,
          paymentterms: companyDetails.paymentTerms,
          jobdescription: companyDetails.jobDescription,
          bankdetails: {
            accountname: companyDetails.bankDetails.accountName,
            accountno: companyDetails.bankDetails.accountNo,
            accounttype: companyDetails.bankDetails.accountType,
            bankname: companyDetails.bankDetails.bankName,
            branch: companyDetails.bankDetails.branch,
            ifsc: companyDetails.bankDetails.ifsc
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success('Company details updated successfully!');
        response.data.token &&
          localStorage.setItem('cracker_token', response.data.token);
        fetchCompanyDetails();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating company details: ', error);
      toast.error('Failed to update company details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      } md:p-4`}
    >
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size={60} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl shadow-xl p-8 flex flex-col gap-12 scrollbar-${
              theme === 'dark' ? 'dark' : 'light'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor:
                theme === 'dark' ? '#4B5563 #1F2937' : '#D1D5DB #FFFFFF'
            }}
          >
            {/* User Details Section */}
            <div>
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                User Details
              </h2>
              <form
                onSubmit={handleUserSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userDetails.name}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={userDetails.phoneNumber}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={userDetails.password}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={userDetails.confirmPassword}
                    onChange={handleUserChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="md:col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                  >
                    Update User Details
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Company Details Section */}
            <div>
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                Company Details
              </h2>
              <form
                onSubmit={handleCompanySubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyDetails.companyName}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Company Tagline
                  </label>
                  <input
                    type="text"
                    name="companyTagline"
                    value={companyDetails.companyTagline}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter company tagline"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Shop Address *
                  </label>
                  <textarea
                    name="shopAddress"
                    value={companyDetails.shopAddress}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter shop address"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="personContact"
                    value={companyDetails.personContact}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={companyDetails.contactEmail}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter company email"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={companyDetails.contactPhone}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter company phone number"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={companyDetails.gstNumber}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter GST number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Payment Terms
                  </label>
                  <textarea
                    name="paymentTerms"
                    value={companyDetails.paymentTerms}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter payment terms"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Job Description
                  </label>
                  <textarea
                    name="jobDescription"
                    value={companyDetails.jobDescription}
                    onChange={handleCompanyChange}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter job description"
                    rows="3"
                  />
                </div>

                {/* Bank Details Section */}
                <div className="md:col-span-2">
                  <h3
                    className={`text-xl font-semibold mb-4 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}
                  >
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountName"
                        value={companyDetails.bankDetails.accountName}
                        onChange={handleCompanyChange}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter account name"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountNo"
                        value={companyDetails.bankDetails.accountNo}
                        onChange={handleCompanyChange}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Account Type
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountType"
                        value={companyDetails.bankDetails.accountType}
                        onChange={handleCompanyChange}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter account type"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={companyDetails.bankDetails.bankName}
                        onChange={handleCompanyChange}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Branch
                      </label>
                      <input
                        type="text"
                        name="bankDetails.branch"
                        value={companyDetails.bankDetails.branch}
                        onChange={handleCompanyChange}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter branch name"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="bankDetails.ifsc"
                        value={companyDetails.bankDetails.ifsc}
                        onChange={handleCompanyChange}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                  >
                    Update Company Details
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>

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
            background: #F3F4F6;
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
  );
}

export default Settings;
