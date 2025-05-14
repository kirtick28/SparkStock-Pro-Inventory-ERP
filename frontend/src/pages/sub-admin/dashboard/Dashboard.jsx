import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import axios from 'axios';
import DashboardComponents from '../../../components/DashboardComponents';
import { useTheme } from '../../../contexts/ThemeContext';

const Dashboard = ({ userName }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('cracker_token');
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/order/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div
        className={`min-h-screen p-6 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        } flex justify-center items-center`}
      >
        <Loader size={60} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-gray-900 text-gray-100'
          : 'bg-gray-100 text-gray-800'
      } space-y-8`}
    >
      <header className="flex items-center justify-between">
        <h1
          className={`text-3xl font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          Welcome, <span className="text-blue-600">{userName}</span>
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardComponents.StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Revenue"
          value={`₹${dashboardData?.totalRevenue || 0}`}
          change={parseFloat(dashboardData?.totalRevenueChange || 0)}
          accent="bg-green-100 text-green-700"
        />
        <DashboardComponents.StatCard
          icon={<FileText className="w-6 h-6" />}
          title="Total Invoices"
          value={`${dashboardData?.totalInvoices || 0}`}
          change={parseFloat(dashboardData?.totalInvoicesChange || 0)}
          accent="bg-blue-100 text-blue-700"
        />
        <DashboardComponents.StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Customers"
          value={`${dashboardData?.totalCustomers || 0}`}
          change={parseFloat(dashboardData?.totalCustomersChange || 0)}
          accent="bg-yellow-100 text-yellow-700"
        />
        <DashboardComponents.StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Current Month Revenue"
          value={`₹${dashboardData?.currentMonthRevenue || 0}`}
          change={parseFloat(dashboardData?.currentMonthRevenueChange || 0)}
          accent="bg-purple-100 text-purple-700"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DashboardComponents.RevenueChart
            currentMonth={dashboardData?.currentMonthRevenue || 0}
            monthlyRevenue={dashboardData?.monthlyRevenue || []}
          />
        </div>
        <div className="space-y-6">
          <DashboardComponents.SalesDistributionChart
            salesDistribution={
              dashboardData?.salesDistribution || {
                productRevenue: 0,
                giftBoxRevenue: 0
              }
            }
          />
        </div>
      </section>

      <section>
        <DashboardComponents.RecentInvoices
          invoices={dashboardData?.topOrders || []}
        />
      </section>
    </div>
  );
};

export default React.memo(Dashboard);
