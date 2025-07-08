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
    if (!roomId) {
      setLoading(false);
      return;
    }

    
    // If not connected, wait a bit for connection
    if (!websocket.connected) {
      setLoading(true);
      
      // Set a timeout to check connection after a delay
      const checkTimeout = setTimeout(() => {
        if (websocket.connected) {
          requestRoomData();
        } else {
          setError(new Error('WebSocket no conectado'));
          setLoading(false);
        }
      }, 2000); // Wait 2 seconds for connection
      
      return () => clearTimeout(checkTimeout);
    }
    
    // If already connected, request immediately
    requestRoomData();
    
    function requestRoomData() {
      
      // Use getRoomInfo with client:getRoomInfo event
      websocket.getRoomInfo(roomId)
        .then((roomInfo) => {
          
          if (roomInfo) {
            // Add room_id to the data if not present
            const roomData = {
              ...roomInfo,
              room_id: roomId
            };
            setRoom(roomData);
            setError(null);
          } else {
            setError(new Error('No se encontraron datos de la sala'));
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
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
        setRoom(updatedRoom);
        setLoading(false);
      }
    }

    // Handle room info update
    if (type === 'room:info:update' && data) {
      // Check if this update is for our room
      const updateRoomId = data.host?.gameURI?.split('/').pop() || data.room_id;
      
      if (updateRoomId === roomId) {
        const roomData = {
          ...data,
          room_id: roomId
        };
        setRoom(roomData);
        setLoading(false);
      }
    }
    
    // Handle specific room updates
    if ((type === 'room:status:changed' || type === 'game:state:updated') && 
        (data.roomId === roomId || data.room_id === roomId)) {
      // Request fresh data for this specific room
      websocket.getRoomInfo(roomId)
        .then((roomInfo) => {
          if (roomInfo) {
            const roomData = {
              ...roomInfo,
              room_id: roomId
            };
            setRoom(roomData);
          }
        })
        .catch(() => {});
    }
  }, [websocket.lastUpdate, roomId]);

  // Calculate statistics from room data
  const statistics = useMemo(() => {
    if (!room) return null;


    // Handle the nested structure from server:getRoomInfo
    let roomData, gameData, usersData;
    
    if (room.host && room.game) {
      // New structure: { host: {...}, game: {...} }
      roomData = room.host;
      gameData = room.game;
      usersData = room.host.users || [];
      
    } else {
      // Old structure fallback
      roomData = room;
      gameData = room.game || {};
      usersData = room.users || [];
    }

    // Calculate sold cards from users
    const soldCards = usersData.reduce((total, user) => {
      // Count cards for users that are not 'leftRoom'
      if (user.status !== 'leftRoom') {
        return total + (user.cards?.length || 0);
      }
      return total;
    }, 0);
    
    // Get active users (not leftRoom)
    const activeUsers = usersData.filter(user => user.status !== 'leftRoom');

    // Get cards data
    const cardsData = roomData.cards || {};
    const availableCards = cardsData.availableCards || 0;
    const totalCards = cardsData.total || 0;
    const cardPrice = cardsData.price || roomData.card_price || 0;

    // Calculate revenue
    const revenue = soldCards * cardPrice;

    // Get game status
    const gameStatus = gameData.status || roomData.status || 'waiting';

    // Format statistics similar to API response
    return {
      current_metrics: {
        connected_users: activeUsers.length,
        sold_cards: soldCards,
        total_cards: totalCards,
        available_cards: availableCards,
        revenue: revenue,
        revenue_formatted: formatCurrency(revenue),
        card_price: cardPrice,
        occupancy_percentage: totalCards > 0 ? (soldCards / totalCards) * 100 : 0,
        occupancy_formatted: `${Math.round(totalCards > 0 ? (soldCards / totalCards) * 100 : 0)}%`,
        game_status: gameStatus,
        game_status_text: getGameStatusText(gameStatus),
        game_time_seconds: gameData.timeleft ? Math.floor(gameData.timeleft / 1000) : null,
        game_duration_formatted: formatGameDuration(gameData.timeleft),
        room_name: roomData.name || room.room_name,
        room_id: room.room_id || roomData.gameURI?.split('/').pop(),
        game_id: gameData.id,
        game_type: gameData.type || roomData.typeOfGame
      },
      requirements_status: {
        // Si hay min_value, calcular cuántos cartones se necesitan basándose en el precio
        // Si hay min_cards, usar ese valor directamente
        minimum_cards: roomData.min_cards || 
          (roomData.min_value && cardPrice > 0 ? Math.ceil(roomData.min_value / cardPrice) : 0) || 
          100, // Default min
        minimum_value: roomData.min_value || (roomData.min_cards ? roomData.min_cards * cardPrice : 0),
        current_cards: soldCards,
        current_value: revenue,
        can_start_game: roomData.min_value 
          ? revenue >= roomData.min_value  // Si hay min_value, comparar por valor
          : soldCards >= (roomData.min_cards || 100), // Si no, comparar por cartones
        percentage_complete: roomData.min_value 
          ? (roomData.min_value > 0 ? (revenue / roomData.min_value) * 100 : 0)
          : ((roomData.min_cards || 100) > 0 ? (soldCards / (roomData.min_cards || 100)) * 100 : 0)
      },
      rewards: {
        linea: roomData.rewards?.linea || 0,
        bingo: roomData.rewards?.bingo || 0
      },
      users: usersData,
      room_data: room // Include raw room data
    };
  }, [room]);

  return {
    statistics,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      setError(null);
      
      // Use getRoomInfo directly for the specific room
      websocket.getRoomInfo(roomId)
        .then((roomInfo) => {
          
          if (roomInfo) {
            // Add room_id to the data if not present
            const roomData = {
              ...roomInfo,
              room_id: roomId
            };
            setRoom(roomData);
            setError(null);
          } else {
            setError(new Error('No se recibieron datos de la sala'));
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