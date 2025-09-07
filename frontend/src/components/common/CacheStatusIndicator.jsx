import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CacheStatusIndicator = ({
  isDataStale,
  lastFetched,
  onRefresh,
  loading = false,
  size = 'sm',
  showLastFetched = true
}) => {
  const { theme } = useTheme();

  const formatLastFetched = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = () => {
    if (loading) return 'blue';
    if (isDataStale) return 'orange';
    return 'green';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="animate-spin" />;
    if (isDataStale) return <WifiOff />;
    return <Wifi />;
  };

  const getStatusText = () => {
    if (loading) return 'Refreshing...';
    if (isDataStale) return 'Data may be outdated';
    return 'Data is fresh';
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    orange:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    green:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-200
        ${sizeClasses[size]}
        ${colorClasses[statusColor]}
        ${isDataStale && !loading ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={isDataStale && !loading ? onRefresh : undefined}
      title={
        isDataStale && !loading ? 'Click to refresh data' : getStatusText()
      }
    >
      <span style={{ fontSize: iconSizes[size] }}>{getStatusIcon()}</span>

      <span className="whitespace-nowrap">{getStatusText()}</span>

      {showLastFetched && lastFetched && (
        <>
          <span className="opacity-60">•</span>
          <span className="opacity-75 flex items-center gap-1">
            <Clock size={iconSizes[size] - 2} />
            {formatLastFetched(lastFetched)}
          </span>
        </>
      )}
    </motion.div>
  );
};

export default CacheStatusIndicator;
