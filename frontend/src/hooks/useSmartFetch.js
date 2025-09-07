import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Custom hook for smart data fetching with caching
 * @param {Function} fetchAction - Redux async thunk action to dispatch
 * @param {string} sliceName - Name of the Redux slice (e.g., 'products', 'giftBox')
 * @param {Object} options - Configuration options
 * @param {boolean} options.skipCache - Force refresh ignoring cache
 * @param {number} options.customTimeout - Custom cache timeout in milliseconds
 * @param {Array} options.dependencies - Dependencies to trigger refetch
 */
export const useSmartFetch = (fetchAction, sliceName, options = {}) => {
  const dispatch = useDispatch();
  const {
    skipCache = false,
    customTimeout,
    dependencies = [],
    autoFetch = true
  } = options;

  const sliceState = useSelector((state) => state[sliceName]);
  const { loading, error, lastFetched, cacheTimeout } = sliceState;

  // Function to check if data is stale
  const isDataStale = useCallback(() => {
    if (!lastFetched) return true;
    if (skipCache) return true;

    const timeout = customTimeout || cacheTimeout || 5 * 60 * 1000; // 5 minutes default
    const timeSinceLastFetch = Date.now() - lastFetched;

    return timeSinceLastFetch > timeout;
  }, [lastFetched, skipCache, customTimeout, cacheTimeout]);

  // Function to fetch data
  const fetchData = useCallback(
    (forceRefresh = false) => {
      if (forceRefresh || isDataStale()) {
        dispatch(fetchAction(forceRefresh));
      }
    },
    [dispatch, fetchAction, isDataStale]
  );

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    loading,
    error,
    refresh,
    fetchData,
    isDataStale: isDataStale(),
    lastFetched
  };
};

export default useSmartFetch;
