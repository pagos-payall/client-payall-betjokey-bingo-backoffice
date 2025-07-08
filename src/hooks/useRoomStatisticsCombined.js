import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '@/components/WebSocketProvider';
import { useFormattedStatistics } from '@/hooks/useRoomStatistics';
import { formatCurrency, formatNumber } from '@/services/utilFunctions';

/**
 * Hook that combines static data from API with real-time data from WebSocket
 * API provides: configuration, requirements, financial breakdown, daily stats
 * WebSocket provides: real-time users, cards, game status
 */
export function useRoomStatisticsCombined(roomId, roomContextData = null) {
  const [wsRoom, setWsRoom] = useState(null);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState(null);
  const [lastApiRefresh, setLastApiRefresh] = useState(null);
  
  const websocket = useWebSocketContext();
  
  // Check if room is archived from context data
  const isArchived = roomContextData?.status === 'archive' || roomContextData?.status === 'archived';
  
  // Wrap getRoomInfo to prevent calls for archived rooms
  const safeGetRoomInfo = useCallback((roomId) => {
    if (isArchived) {
      return Promise.reject(new Error('Room is archived'));
    }
    return websocket.getRoomInfo(roomId, roomContextData?.status);
  }, [websocket, isArchived, roomContextData?.status]);
  
  // Get static data from API (auto-refresh every 5 minutes)
  const { 
    statistics: apiStatistics, 
    loading: apiLoading, 
    error: apiError,
    refresh: apiRefresh 
  } = useFormattedStatistics(roomId, {
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    enabled: true // Ensure API is enabled
  });

  // API data will be combined with WebSocket data below
  
  // Single log when API data first loads
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && apiStatistics?.requirements_status && !wsRoom) {
      console.log('📊 [useRoomStatisticsCombined] API data loaded for room:', roomId, {
        isArchived,
        minCards: apiStatistics.requirements_status.minimum_cards
      });
    }
  }, [apiStatistics?.requirements_status, roomId, isArchived, wsRoom]);

  // Request WebSocket room data (only for active rooms)
  const requestWsData = useCallback(() => {
    if (!roomId || !websocket.connected) {
      return;
    }

    // Don't request WebSocket data for archived rooms
    if (isArchived || 
        apiStatistics?.current_metrics?.game_status === 'archive' || 
        apiStatistics?.current_metrics?.game_status === 'archived') {
      setWsLoading(false);
      setWsRoom(null);
      return;
    }

    setWsLoading(true);
    
    safeGetRoomInfo(roomId)
      .then((roomInfo) => {
        
        if (roomInfo) {
          setWsRoom(roomInfo);
          setWsError(null);
        } else {
          setWsError(new Error('No se recibieron datos de la sala'));
        }
        setWsLoading(false);
      })
      .catch((err) => {
        setWsError(err);
        setWsLoading(false);
      });
  }, [roomId, websocket.connected, safeGetRoomInfo, apiStatistics?.current_metrics?.game_status, isArchived, roomContextData?.status]);

  // Initial WebSocket data request
  useEffect(() => {
    if (!roomId) {
      setWsLoading(false);
      return;
    }
    
    // Skip WebSocket for archived rooms
    if (isArchived) {
      setWsLoading(false);
      setWsRoom(null);
      return;
    }

    // Wait for connection if needed
    if (!websocket.connected) {
      const checkTimeout = setTimeout(() => {
        if (websocket.connected && !isArchived) {
          requestWsData();
        } else {
          setWsError(new Error('WebSocket no conectado'));
          setWsLoading(false);
        }
      }, 2000);
      
      return () => clearTimeout(checkTimeout);
    }
    
    if (!isArchived) {
      requestWsData();
    }
  }, [roomId, requestWsData, isArchived]);

  // Listen for WebSocket updates
  useEffect(() => {
    if (!websocket.lastUpdate || !roomId || isArchived) return;

    const { type, data } = websocket.lastUpdate;

    // Handle room info updates
    if (type === 'room:info:update' && data) {
      const updateRoomId = data.host?.gameURI?.split('/').pop() || data.room_id;
      
      if (updateRoomId === roomId) {
        setWsRoom(data);
      }
    }
    
    // Handle status changes - request fresh data
    if ((type === 'room:status:changed' || type === 'game:state:updated') && 
        (data.roomId === roomId || data.room_id === roomId)) {
      requestWsData();
    }
  }, [websocket.lastUpdate, roomId, requestWsData]);

  // Combine and calculate statistics
  const combinedStatistics = useMemo(() => {
    // Use API data as base, enhance with WebSocket if available
    if (!apiStatistics && !wsRoom) return null;

    // API data is now logged in useEffect above

    // Extract data from API or WebSocket
    const roomData = wsRoom?.host || {};
    const gameData = wsRoom?.game || {};
    const usersData = roomData.users || [];

    // Use API data as base, override with WebSocket if available
    const apiMetrics = apiStatistics?.current_metrics || {};
    
    // Calculate real-time metrics from WebSocket or use API data
    const soldCards = wsRoom ? usersData.reduce((total, user) => {
      if (user.status !== 'leftRoom') {
        return total + (user.cards?.length || 0);
      }
      return total;
    }, 0) : (apiMetrics.sold_cards || 0);
    
    const activeUsers = wsRoom ? usersData.filter(user => user.status !== 'leftRoom') : [];
    const cardsData = roomData.cards || {};
    
    // Get card price from WebSocket, API, or room context data
    const cardPrice = cardsData.price || 
                      apiMetrics.card_price || 
                      roomContextData?.card_price || 
                      0;
                      
    const revenue = soldCards * cardPrice;

    // Get requirements - prioritize API data if available, fallback to WebSocket
    let requirements;
    if (apiStatistics && apiStatistics.requirements_status) {
      // Use API data when available
      requirements = apiStatistics.requirements_status;
    } else if (roomData.min_cards !== undefined || roomData.min_value !== undefined) {
      // Use WebSocket data as fallback
      requirements = {
        minimum_cards: roomData.min_cards || 100,
        minimum_value: roomData.min_value || null,
        missing_requirements: []
      };
    } else if (roomContextData) {
      // Use room context data as fallback
      requirements = {
        minimum_cards: roomContextData.min_cards || roomContextData.minimum_cards || 100,
        minimum_value: roomContextData.min_value || roomContextData.minimum_value || null,
        missing_requirements: []
      };
    } else {
      // Final fallback
      requirements = {
        minimum_cards: 100,
        minimum_value: null,
        missing_requirements: []
      };
    }
    
    // Requirements are now set from API or WebSocket data

    // Calculate if can start game based on requirements
    let canStartGame = false;
    let percentageComplete = 0;
    let minimumCardsNeeded = requirements.minimum_cards;

    if (requirements.minimum_value && requirements.minimum_value > 0) {
      // Use minimum value
      canStartGame = revenue >= requirements.minimum_value;
      percentageComplete = (revenue / requirements.minimum_value) * 100;
      minimumCardsNeeded = Math.ceil(requirements.minimum_value / cardPrice);
    } else {
      // Use minimum cards
      canStartGame = soldCards >= requirements.minimum_cards;
      percentageComplete = (soldCards / requirements.minimum_cards) * 100;
    }

    return {
      // Combine API base data with real-time WebSocket updates
      current_metrics: {
        connected_users: wsRoom ? activeUsers.length : (apiMetrics.connected_users || 0),
        sold_cards: soldCards,
        total_cards: cardsData.total || apiMetrics.total_cards || 
          (roomContextData?.typeOfGame === 'Series 12000' ? 12000 : 4000),
        available_cards: cardsData.availableCards || apiMetrics.available_cards || 
          (cardsData.total || apiMetrics.total_cards || 
           (roomContextData?.typeOfGame === 'Series 12000' ? 12000 : 4000)) - soldCards,
        revenue: revenue || apiMetrics.revenue || 0,
        revenue_formatted: formatCurrency(revenue || apiMetrics.revenue || 0),
        card_price: cardPrice,
        occupancy_percentage: apiMetrics.occupancy_percentage || 
          (cardsData.total > 0 ? (soldCards / cardsData.total) * 100 : 0),
        occupancy_formatted: formatOccupancy(
          soldCards || apiMetrics.sold_cards || 0, 
          cardsData.total || apiMetrics.total_cards || 
          (roomContextData?.typeOfGame === 'Series 12000' ? 12000 : 4000)
        ),
        game_status: isArchived ? 'archive' : (gameData.status || roomData.status || apiMetrics.game_status || 'waiting'),
        game_status_text: isArchived ? 'No asignado' : getGameStatusText(
          gameData.status || roomData.status || apiMetrics.game_status || 'waiting'
        ),
        game_time_seconds: gameData.timeleft ? Math.floor(gameData.timeleft / 1000) : 
          (apiMetrics.game_time_seconds || null),
        game_duration_formatted: formatGameDuration(
          gameData.timeleft || (apiMetrics.game_time_seconds ? apiMetrics.game_time_seconds * 1000 : null)
        ),
        room_name: roomData.name || apiMetrics.room_name || roomContextData?.room_name || '',
        room_id: roomId,
        game_id: gameData.id || apiMetrics.game_id || null,
        game_type: gameData.type || apiMetrics.game_type || roomContextData?.typeOfGame || ''
      },
      
      // Requirements from API with real-time calculation
      requirements_status: {
        minimum_cards: requirements.minimum_cards,
        minimum_value: requirements.minimum_value,
        minimum_cards_needed: minimumCardsNeeded,
        current_cards: soldCards,
        current_value: revenue,
        can_start_game: canStartGame,
        percentage_complete: percentageComplete,
        missing_requirements: requirements.missing_requirements || []
      },
      
      // Static data from API
      financial_breakdown: apiStatistics?.financial_breakdown || null,
      daily_stats: apiStatistics?.daily_stats || null,
      trends: apiStatistics?.trends || null,
      createdAt: apiStatistics?.createdAt || null,
      
      // Raw data for debugging
      _raw: {
        ws: wsRoom,
        api: apiStatistics
      }
    };
  }, [wsRoom, apiStatistics, roomId, roomContextData, isArchived]);

  // Combined refresh function
  const refresh = useCallback(() => {
    setLastApiRefresh(Date.now());
    
    // Refresh both sources
    if (apiRefresh) {
      apiRefresh();
    }
    requestWsData();
  }, [apiRefresh, requestWsData]);

  return {
    statistics: combinedStatistics,
    loading: apiLoading && !apiStatistics, // Show loading only if API hasn't loaded
    error: apiError, // Only show API errors, ignore WebSocket errors for archived rooms
    refresh,
    lastApiRefresh,
    sources: {
      api: { loading: apiLoading, error: apiError, hasData: !!apiStatistics },
      websocket: { loading: wsLoading, error: wsError, hasData: !!wsRoom }
    }
  };
}

// Helper functions
function getGameStatusText(status) {
  const statusMap = {
    'waiting': 'Esperando jugadores',
    'active': 'En progreso',
    'in_progress': 'En progreso',
    'finishing': 'Finalizando',
    'finished': 'Terminado',
    'off': 'Desactivada',
    'archive': 'No asignado',
    'archived': 'No asignado',
    null: 'No asignado',
    undefined: 'No asignado'
  };
  return statusMap[status] || 'Estado desconocido';
}

function formatGameDuration(milliseconds) {
  if (!milliseconds) return 'N/A';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatOccupancy(sold, total) {
  if (!total || total === 0) return '0%';
  
  const percentage = (sold / total) * 100;
  
  // If percentage is very small, show with decimals
  if (percentage < 1 && percentage > 0) {
    return `${percentage.toFixed(2)}%`;
  }
  
  // Otherwise round to nearest integer
  return `${Math.round(percentage)}%`;
}

export default useRoomStatisticsCombined;