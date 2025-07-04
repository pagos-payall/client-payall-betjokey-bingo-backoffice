import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '@/components/WebSocketProvider';
import { formatCurrency, formatNumber } from '@/services/utilFunctions';

/**
 * Custom hook to get room statistics from WebSocket data
 * @param {string} roomId - Room ID to get statistics for
 * @returns {Object} Room statistics from WebSocket
 */
export function useWebSocketStatistics(roomId) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const websocket = useWebSocketContext();

  // Request rooms list when component mounts or roomId changes
  useEffect(() => {
    if (!roomId || !websocket.connected) {
      setLoading(false);
      return;
    }

    console.log(`📊 [useWebSocketStatistics] Requesting rooms for ${roomId}`);
    
    // Request initial data
    websocket.getRoomsList()
      .then((rooms) => {
        const foundRoom = rooms.find(r => 
          (r.room === roomId) || 
          (r.room_id === roomId) || 
          (r.roomId === roomId)
        );
        
        if (foundRoom) {
          console.log(`📊 [useWebSocketStatistics] Room found:`, foundRoom);
          setRoom(foundRoom);
          setError(null);
        } else {
          console.warn(`📊 [useWebSocketStatistics] Room ${roomId} not found`);
          setError(new Error('Sala no encontrada'));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(`📊 [useWebSocketStatistics] Error:`, err);
        setError(err);
        setLoading(false);
      });
  }, [roomId, websocket.connected]);

  // Listen for updates
  useEffect(() => {
    if (!websocket.lastUpdate || !roomId) return;

    const { type, data } = websocket.lastUpdate;

    // Handle full rooms list update
    if (type === 'rooms:list:full' && data.rooms) {
      const updatedRoom = data.rooms.find(r => 
        (r.room === roomId) || 
        (r.room_id === roomId) || 
        (r.roomId === roomId)
      );
      
      if (updatedRoom) {
        console.log(`📊 [useWebSocketStatistics] Room updated from list:`, updatedRoom);
        setRoom(updatedRoom);
        setLoading(false);
      }
    }

    // Handle specific room updates
    if ((type === 'room:status:changed' || type === 'game:state:updated') && 
        (data.roomId === roomId || data.room_id === roomId)) {
      // Request fresh data for this specific room
      websocket.getRoomsList()
        .then((rooms) => {
          const updatedRoom = rooms.find(r => 
            (r.room === roomId) || 
            (r.room_id === roomId) || 
            (r.roomId === roomId)
          );
          if (updatedRoom) {
            setRoom(updatedRoom);
          }
        })
        .catch(console.error);
    }
  }, [websocket.lastUpdate, roomId]);

  // Calculate statistics from room data
  const statistics = useMemo(() => {
    if (!room) return null;

    // Calculate sold cards
    const soldCards = room.users?.reduce((total, user) => {
      return total + (user.cards?.length || 0);
    }, 0) || 0;

    // Calculate total cards
    const totalCards = (room.availableCards || 0) + soldCards;

    // Calculate revenue
    const revenue = soldCards * (room.card_price || 0);

    // Get game status
    const gameStatus = room.game?.status || room.status || 'waiting';

    // Format statistics similar to API response
    return {
      current_metrics: {
        connected_users: room.users?.length || 0,
        sold_cards: soldCards,
        total_cards: totalCards,
        available_cards: room.availableCards || 0,
        revenue: revenue,
        revenue_formatted: formatCurrency(revenue),
        card_price: room.card_price || 0,
        occupancy_percentage: totalCards > 0 ? (soldCards / totalCards) * 100 : 0,
        occupancy_formatted: `${Math.round(totalCards > 0 ? (soldCards / totalCards) * 100 : 0)}%`,
        game_status: gameStatus,
        game_status_text: getGameStatusText(gameStatus),
        game_time_seconds: room.game?.timeleft ? Math.floor(room.game.timeleft / 1000) : null,
        game_duration_formatted: formatGameDuration(room.game?.timeleft),
        room_name: room.name || room.room_name,
        room_id: room.room || room.room_id,
        game_id: room.game_id
      },
      requirements_status: {
        minimum_cards: room.min_cards || room.min_value || 100, // Default min
        current_cards: soldCards,
        can_start_game: soldCards >= (room.min_cards || room.min_value || 100),
        percentage_complete: (room.min_cards || room.min_value) > 0 
          ? (soldCards / (room.min_cards || room.min_value)) * 100 
          : 0
      },
      rewards: {
        linea: room.rewards?.linea || 0,
        bingo: room.rewards?.bingo || 0
      },
      room_data: room // Include raw room data
    };
  }, [room]);

  return {
    statistics,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      websocket.getRoomsList()
        .then((rooms) => {
          const foundRoom = rooms.find(r => 
            (r.room === roomId) || 
            (r.room_id === roomId) || 
            (r.roomId === roomId)
          );
          if (foundRoom) {
            setRoom(foundRoom);
            setError(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
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
    'archive': 'Archivada'
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

export default useWebSocketStatistics;