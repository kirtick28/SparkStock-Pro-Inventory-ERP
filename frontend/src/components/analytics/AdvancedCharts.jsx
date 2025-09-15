import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

// Color palette for charts
const COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#84CC16',
  '#EC4899',
  '#6366F1'
];

const DARK_COLORS = [
  '#60A5FA',
  '#F87171',
  '#34D399',
  '#FBBF24',
  '#A78BFA',
  '#22D3EE',
  '#FB923C',
  '#A3E635',
  '#F472B6',
  '#818CF8'
];

// Multi-purpose chart component
export const AdvancedChart = ({
  data,
  chartType = 'line',
  title,
  xKey,
  yKeys = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  colors = null
}) => {
  const { theme } = useTheme();
  const chartColors = colors || (theme === 'dark' ? DARK_COLORS : COLORS);

  const commonProps = {
    width: '100%',
    height,
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const gridProps = showGrid
    ? {
        stroke: theme === 'dark' ? '#374151' : '#E5E7EB',
        strokeDasharray: '3 3'
      }
    : {};

  const axisProps = {
    tick: { fill: theme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 12 },
    axisLine: { stroke: theme === 'dark' ? '#4B5563' : '#9CA3AF' },
    tickLine: { stroke: theme === 'dark' ? '#4B5563' : '#9CA3AF' }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ fill: chartColors[index % chartColors.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = yKeys.map((key, index) => ({
          name: key,
          value: data.reduce((sum, item) => sum + (item[key] || 0), 0),
          fill: chartColors[index % chartColors.length]
        }));

        return (
          <PieChart {...commonProps}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={Math.min(height * 0.35, 120)}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis dataKey={yKeys[0]} {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            <Scatter data={data} fill={chartColors[0]} />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
            <PolarAngleAxis
              dataKey={xKey}
              tick={{
                fill: theme === 'dark' ? '#D1D5DB' : '#374151',
                fontSize: 12
              }}
            />
            <PolarRadiusAxis
              tick={{
                fill: theme === 'dark' ? '#D1D5DB' : '#374151',
                fontSize: 10
              }}
            />
            {yKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                fillOpacity={0.3}
              />
            ))}
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            {showLegend && <Legend />}
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F9FAFB' : '#111827'
              }}
            />
            {showLegend && <Legend />}
            {yKeys.slice(0, Math.floor(yKeys.length / 2)).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
            {yKeys.slice(Math.floor(yKeys.length / 2)).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={
                  chartColors[
                    (index + Math.floor(yKeys.length / 2)) % chartColors.length
                  ]
                }
                strokeWidth={2}
              />
            ))}
          </ComposedChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div
      className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-4 shadow-lg`}
    >
      {title && (
        <h3
          className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

// Real-time metrics card
export const MetricCard = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  subtext
}) => {
  const { theme } = useTheme();

  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50',
      icon: 'text-blue-500',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
      icon: 'text-green-500',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-600'
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
      icon: 'text-red-500',
      text: theme === 'dark' ? 'text-red-400' : 'text-red-600'
    },
    yellow: {
      bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50',
      icon: 'text-yellow-500',
      text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50',
      icon: 'text-purple-500',
      text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 shadow-lg border ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            {value}
          </p>
          {change !== undefined && (
            <p
              className={`text-sm mt-1 ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)}%
            </p>
          )}
          {subtext && (
            <p
              className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${currentColor.bg}`}>
          <div className={`w-6 h-6 ${currentColor.icon}`}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

// Interactive data table
export const DataTable = ({
  data,
  columns,
  title,
  searchable = true,
  exportable = true
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredData = data.filter((item) =>
    searchable
      ? Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div
      className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-lg`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          {title && (
            <h3
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}
            >
              {title}
            </h3>
          )}
          <div className="flex items-center space-x-2">
            {searchable && (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortField === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } divide-y ${
              theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
            }`}
          >
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className={`hover:${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
