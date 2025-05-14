import React from 'react';
import { Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';

// Chart Registrations
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
);

export const StatCard = ({ icon, title, value, change, accent }) => {
  const { theme } = useTheme();
  return (
    <div
      className={`p-6 rounded-xl ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 shadow-lg'
          : 'bg-white border-gray-100'
      } shadow-sm border`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-opacity-20'
          } backdrop-blur-sm`}
        >
          <span className={theme === 'dark' ? 'text-gray-200' : ''}>
            {icon}
          </span>
        </div>
        <span
          className={`text-sm font-medium ${
            change >= 0
              ? theme === 'dark'
                ? 'text-green-400'
                : 'text-green-600'
              : theme === 'dark'
              ? 'text-red-400'
              : 'text-red-600'
          }`}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>
      <h3
        className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
        } mb-1`}
      >
        {title}
      </h3>
      <p
        className={`text-2xl font-semibold ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export const RevenueChart = ({ monthlyRevenue, currentMonth }) => {
  const { theme } = useTheme();

  const data = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyRevenue,
        fill: false,
        borderColor: theme === 'dark' ? '#60A5FA' : '#3B82F6',
        tension: 0.1,
        pointBackgroundColor: theme === 'dark' ? '#60A5FA' : '#3B82F6',
        pointBorderColor: theme === 'dark' ? '#60A5FA' : '#3B82F6',
        pointRadius: monthlyRevenue.map((val) => (val > 0 ? 3 : 0)), // Show points only if data > 0
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          callback: function (value) {
            return '₹' + (value / 1000).toLocaleString() + 'k';
          }
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563'
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'
      } h-full`} // Ensures the card itself takes full height of its grid cell
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          Revenue Overview
        </h3>
        <span
          className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Current Month: ₹{currentMonth.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="relative h-80">
        {' '}
        {/* Canvas container for Line chart */}
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export const RecentInvoices = ({ invoices }) => {
  const { theme } = useTheme();
  return (
    <div
      className={`${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'
      } rounded-xl shadow-sm border overflow-hidden`}
    >
      <div
        className={`p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
        }`}
      >
        <h3
          className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          Recent Transactions
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            <tr>
              {['Invoice #', 'Date', 'Client', 'Amount', 'Status'].map(
                (header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'
            }`}
          >
            {invoices?.map((invoice) => (
              <tr key={invoice.id}>
                <td
                  className={`px-6 py-4 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  #{invoice.id}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {invoice.customerName}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  ₹{invoice.amount}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={invoice.invoiceLink}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SalesDistributionChart = ({ salesDistribution }) => {
  const { theme } = useTheme();

  const data = {
    labels: ['Products', 'Gift Boxes'],
    datasets: [
      {
        data: [
          salesDistribution.productRevenue || 0,
          salesDistribution.giftBoxRevenue || 0
        ],
        backgroundColor: ['#34D399', '#60A5FA'],
        borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#D1D5DB' : '#1F2937',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(2) : 0;
            return `${label}: ₹${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } h-full`} // Added h-full for consistency
    >
      <h2
        className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}
      >
        Sales Distribution
      </h2>
      <div className="relative h-80">
        {' '}
        {/* Changed h-64 to h-80 */}
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default {
  StatCard,
  RevenueChart,
  SalesDistributionChart,
  RecentInvoices
};
