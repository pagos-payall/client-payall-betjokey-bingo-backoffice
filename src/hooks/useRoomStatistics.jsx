import { useState, useEffect, useCallback, useRef } from 'react';
import roomStatisticsService from '@/services/roomStatisticsService';

/**
 * Custom hook for managing room statistics
 * @param {string} roomId - Room ID to fetch statistics for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Whether to automatically refresh data
 * @param {number} options.refreshInterval - Refresh interval in milliseconds (default: 30000)
 * @param {boolean} options.includeHistory - Whether to include game history
 * @param {string} options.period - Time period for historical data
 * @param {boolean} options.enabled - Whether the hook is enabled
 * @returns {Object} Hook state and methods
 */
export function useRoomStatistics(roomId, options = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    includeHistory = false,
    period = 'today',
    enabled = true
  } = options;

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Fetch room statistics from API
   */
  const fetchStatistics = useCallback(async () => {
    if (!roomId || !enabled) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await roomStatisticsService.getRoomStatistics(roomId, {
        includeHistory,
        period
      });

      // Data received successfully

      if (mountedRef.current) {
        setStatistics(data);
        setLastUpdated(new Date());
        // State updated successfully
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        console.error('Error fetching room statistics:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [roomId, includeHistory, period, enabled]);

  /**
   * Refresh statistics manually
   */
  const refresh = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // This useEffect is removed because cleanup is handled in the main useEffect below

  /**
   * Set up auto-refresh and initial fetch
   */
  useEffect(() => {
    mountedRef.current = true; // Ensure component is marked as mounted
    
    if (!roomId || !enabled) {
      setStatistics(null);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchStatistics();

    // Set up auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchStatistics, refreshInterval);
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [roomId, autoRefresh, refreshInterval, fetchStatistics, enabled]);

  return {
    statistics,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting current room metrics only
 * @param {string} roomId - Room ID
 * @param {Object} options - Configuration options
 * @returns {Object} Current metrics state
 */
export function useCurrentMetrics(roomId, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, {
    ...options,
    includeHistory: false
  });

  return {
    metrics: statistics?.current_metrics || null,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting financial breakdown
 * @param {string} roomId - Room ID
 * @param {Object} options - Configuration options
 * @returns {Object} Financial breakdown state
 */
export function useFinancialBreakdown(roomId, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, {
    ...options,
    includeHistory: false
  });

  return {
    financial: statistics?.financial_breakdown || null,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting requirements status
 * @param {string} roomId - Room ID
 * @param {Object} options - Configuration options
 * @returns {Object} Requirements status state
 */
export function useRequirementsStatus(roomId, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, {
    ...options,
    includeHistory: false
  });

  return {
    requirements: statistics?.requirements_status || null,
    canStart: statistics?.requirements_status?.can_start_game || false,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting daily statistics
 * @param {string} roomId - Room ID
 * @param {Object} options - Configuration options
 * @returns {Object} Daily statistics state
 */
export function useDailyStats(roomId, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, {
    ...options,
    includeHistory: false
  });

  return {
    dailyStats: statistics?.daily_stats || null,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting trends data
 * @param {string} roomId - Room ID
 * @param {Object} options - Configuration options
 * @returns {Object} Trends state
 */
export function useTrends(roomId, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, {
    ...options,
    includeHistory: false
  });

  return {
    trends: statistics?.trends || null,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for monitoring game status changes
 * @param {string} roomId - Room ID
 * @param {Function} onStatusChange - Callback when game status changes
 * @param {Object} options - Configuration options
 * @returns {Object} Game status monitoring state
 */
export function useGameStatusMonitor(roomId, onStatusChange, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, {
    ...options,
    includeHistory: false,
    refreshInterval: 10000 // More frequent updates for game status
  });

  const [previousStatus, setPreviousStatus] = useState(null);

  useEffect(() => {
    if (statistics?.current_metrics?.game_status !== undefined) {
      const currentStatus = statistics.current_metrics.game_status;
      
      if (previousStatus !== null && previousStatus !== currentStatus) {
        onStatusChange?.(currentStatus, previousStatus);
      }
      
      setPreviousStatus(currentStatus);
    }
  }, [statistics?.current_metrics?.game_status, previousStatus, onStatusChange]);

  return {
    gameStatus: statistics?.current_metrics?.game_status || null,
    gameStartedAt: statistics?.current_metrics?.game_started_at || null,
    gameTimeSeconds: statistics?.current_metrics?.game_time_seconds || null,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting formatted statistics data
 * @param {string} roomId - Room ID
 * @param {Object} options - Configuration options
 * @returns {Object} Formatted statistics state
 */
export function useFormattedStatistics(roomId, options = {}) {
  const { statistics, loading, error, lastUpdated, refresh } = useRoomStatistics(roomId, options);

  // Format statistics data

  const formatted = statistics ? {
    ...statistics,
    requirements_status: statistics.requirements_status, // Ensure requirements are preserved
    current_metrics: {
      ...statistics.current_metrics,
      revenue_formatted: roomStatisticsService.formatCurrency(statistics.current_metrics?.revenue || 0),
      occupancy_formatted: roomStatisticsService.formatPercentage(statistics.current_metrics?.occupancy_percentage || 0),
      game_status_text: roomStatisticsService.getGameStatusText(statistics.current_metrics?.game_status),
      game_duration_formatted: roomStatisticsService.formatGameDuration(statistics.current_metrics?.game_time_seconds)
    },
    financial_breakdown: statistics.financial_breakdown ? {
      ...statistics.financial_breakdown,
      gross_revenue_formatted: roomStatisticsService.formatCurrency(statistics.financial_breakdown.gross_revenue),
      commission_formatted: roomStatisticsService.formatCurrency(statistics.financial_breakdown.commission),
      special_pot_formatted: roomStatisticsService.formatCurrency(statistics.financial_breakdown.special_pot),
      prizes_formatted: roomStatisticsService.formatCurrency(statistics.financial_breakdown.prizes),
      net_revenue_formatted: roomStatisticsService.formatCurrency(statistics.financial_breakdown.net_revenue),
      taxes_formatted: statistics.financial_breakdown.taxes?.map(tax => ({
        ...tax,
        amount_formatted: roomStatisticsService.formatCurrency(tax.amount)
      }))
    } : null,
    daily_stats: statistics.daily_stats ? {
      ...statistics.daily_stats,
      total_revenue_formatted: roomStatisticsService.formatCurrency(statistics.daily_stats.total_revenue)
    } : null,
    trends: statistics.trends ? {
      ...statistics.trends,
      users_display: roomStatisticsService.getTrendDisplay(statistics.trends.users_trend),
      revenue_display: roomStatisticsService.getTrendDisplay(statistics.trends.revenue_trend)
    } : null
  } : null;

  // Return formatted data

  return {
    statistics: formatted,
    raw: statistics,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export default useRoomStatistics;