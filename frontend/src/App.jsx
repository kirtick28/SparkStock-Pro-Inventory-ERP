import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import LandingPage from './pages/LandingPage';
import BaseLayout from './components/common/BaseLayout';
import Unauthorized from './pages/Unauthorized';
import SubAdminDashboard from './pages/sub-admin/dashboard/Dashboard';
import StockTable from './pages/sub-admin/inventory/StockTable';
import Customers from './pages/sub-admin/customer/Customers';
import PurchaseHistory from './pages/sub-admin/purchaseHistory/PurchaseHistory';
import { ThemeProvider } from './contexts/ThemeContext';
import GiftBox from './pages/sub-admin/giftbox/GiftIndex';
import BillingProduct from './pages/sub-admin/billing/BillingProduct';
import Settings from './pages/sub-admin/settings/Settings';
import SubAdminManagement from './pages/super-admin/subadminManagement';
import SuperAdminSettings from './pages/super-admin/Settings';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Superadmin routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <BaseLayout role="superadmin" />
                </ProtectedRoute>
              }
            >
              <Route path="subadmins" element={<SubAdminManagement />} />
              <Route path="settings" element={<SuperAdminSettings />} />
              <Route
                path="*"
                element={<Navigate to="/super-admin/subadmins" replace />}
              />
            </Route>

            {/* Subadmin routes */}
            <Route
              path="/sub-admin"
              element={
                <ProtectedRoute allowedRoles={['subadmin']}>
                  <BaseLayout role="subadmin" />
                </ProtectedRoute>
              }
            >
              {/* Nested sub-admin routes */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SubAdminDashboard />} />
              <Route path="inventory" element={<StockTable />} />
              <Route path="customers" element={<Customers />} />
              <Route path="history" element={<PurchaseHistory />} />
              <Route path="gifts" element={<GiftBox />} />
              <Route path="billing/:id/:name" element={<BillingProduct />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
