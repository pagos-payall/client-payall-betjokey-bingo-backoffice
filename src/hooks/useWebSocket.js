import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import websocketService from '@/services/websocketService';

export function useWebSocket(showToasts = false) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  
  // Debug: Generar ID único para esta instancia
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  // Deduplicación de eventos
  const processedEvents = useRef(new Set());
  const lastOperationToast = useRef({ roomId: null, timestamp: 0 });
  
  // Función para generar clave única de evento
  const getEventKey = useCallback((eventType, data) => {
    const roomId = data.roomId || data.room_id || 'unknown';
    const timestamp = data.timestamp || Date.now();
    return `${eventType}-${roomId}-${timestamp}`;
  }, []);
  
  // Función para verificar si un evento ya fue procesado
  const isEventProcessed = useCallback((eventType, data) => {
    const key = getEventKey(eventType, data);
    if (processedEvents.current.has(key)) {
      console.log(`⚠️ [useWebSocket] ${instanceId.current} - Evento duplicado ignorado: ${key}`);
      return true;
    }
    processedEvents.current.add(key);
    
    // Limpiar eventos antiguos (mantener solo los últimos 100)
    if (processedEvents.current.size > 100) {
      const array = Array.from(processedEvents.current);
      processedEvents.current = new Set(array.slice(-50));
    }
    
    return false;
  }, [getEventKey]);
  
  // Función para verificar si ya se mostró un toast para esta operación
  const shouldShowOperationToast = useCallback((roomId, operation) => {
    const now = Date.now();
    const recentTime = 2000; // 2 segundos
    
    if (lastOperationToast.current.roomId === roomId && 
        (now - lastOperationToast.current.timestamp) < recentTime) {
      console.log(`🚫 [useWebSocket] ${instanceId.current} - Toast de operación ya mostrado para sala ${roomId}`);
      return false;
    }
    
    lastOperationToast.current = { roomId, timestamp: now };
    return true;
  }, []);
  
  useEffect(() => {
    console.log(`🔧 [useWebSocket] Instancia ${instanceId.current} creada - showToasts: ${showToasts}`);
    return () => {
      console.log(`🗑️ [useWebSocket] Instancia ${instanceId.current} destruida`);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Conectar al montar
    setConnecting(true);
    websocketService.connect();

    // Event handlers
    const handleConnected = () => {
      console.log(`📡 [useWebSocket] ${instanceId.current} - handleConnected, showToasts: ${showToasts}`);
      if (mountedRef.current) {
        setConnected(true);
        setConnecting(false);
        setError(null);
        if (showToasts) {
          console.log(`🍞 [useWebSocket] ${instanceId.current} - Mostrando toast de conexión`);
          toast.success('Conectado al servidor en tiempo real', {
            position: 'bottom-right',
            autoClose: 3000,
            toastId: 'websocket-connected' // Prevenir duplicados
          });
        }
      }
    };

    const handleDisconnected = (reason) => {
      if (mountedRef.current) {
        setConnected(false);
        if (reason !== 'io client disconnect' && showToasts) {
          toast.warning('Conexión perdida. Intentando reconectar...', {
            position: 'bottom-right',
            autoClose: 5000
          });
        }
      }
    };

    const handleReconnected = (attemptNumber) => {
      if (mountedRef.current) {
        setConnected(true);
        setError(null);
        if (showToasts) {
          toast.success(`Reconectado después de ${attemptNumber} intentos`, {
            position: 'bottom-right',
            autoClose: 3000
          });
        }
      }
    };

    const handleReconnecting = (attemptNumber) => {
      if (mountedRef.current) {
        setConnecting(true);
        if (attemptNumber === 1 && showToasts) {
          toast.info('Reconectando...', {
            position: 'bottom-right',
            autoClose: false,
            toastId: 'reconnecting'
          });
        }
      }
    };

    const handleError = (error) => {
      if (mountedRef.current) {
        setError(error);
        setConnecting(false);
        console.error('WebSocket error:', error);
      }
    };

    const handleAuthError = (error) => {
      if (mountedRef.current) {
        if (showToasts) {
          toast.error('Error de autenticación. Por favor, inicia sesión nuevamente.', {
            position: 'bottom-right',
            autoClose: 5000
          });
        }
      }
    };

    const handleUnauthorized = (error) => {
      if (mountedRef.current) {
        if (showToasts) {
          toast.error('Sesión expirada. Redirigiendo al login...', {
            position: 'bottom-right',
            autoClose: 3000
          });
        }
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    };

    // Room events handlers
    const handleRoomUpdate = (data) => {
      if (mountedRef.current) {
        setLastUpdate({
          type: 'room:update',
          data,
          timestamp: Date.now()
        });
      }
    };

    const handleRoomStatusChanged = (data) => {
      console.log(`🔄 [useWebSocket] ${instanceId.current} - handleRoomStatusChanged:`, data);
      
      // Verificar duplicados
      if (isEventProcessed('room:status:changed', data)) {
        return;
      }
      
      console.log('  - Mounted:', mountedRef.current, 'showToasts:', showToasts);
      
      if (mountedRef.current) {
        const update = {
          type: 'room:status:changed',
          data,
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate:', update);
        setLastUpdate(update);
        
        // Notificación específica según el estado
        const statusMessages = {
          'waiting': '🟡 en espera de jugadores',
          'active': '🟢 juego activo',
          'off': '⚫ desactivada',
          'archive': '📦 archivada'
        };
        
        const message = statusMessages[data.newStatus] || data.newStatus;
        // No mostrar toast para cambios de estado si es parte de una activación
        if (showToasts && data.newStatus !== 'waiting' && shouldShowOperationToast(data.roomId || data.room_id, 'status-change')) {
          console.log(`🍞 [useWebSocket] ${instanceId.current} - Mostrando toast cambio estado`);
          toast.info(`Sala ${data.roomName || data.roomId}: ${message}`, {
            position: 'top-right',
            autoClose: 4000,
            toastId: `room-operation-${data.roomId || data.room_id}` // Un toast por operación
          });
        }
      }
    };

    const handleRoomActivated = (data) => {
      console.log(`🟢 [useWebSocket] ${instanceId.current} - handleRoomActivated:`, data);
      
      // Verificar duplicados
      if (isEventProcessed('room:activated', data)) {
        return;
      }
      
      console.log('  - Mounted:', mountedRef.current, 'showToasts:', showToasts);
      
      if (mountedRef.current) {
        const update = {
          type: 'room:activated',
          data,
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate:', update);
        setLastUpdate(update);
        
        if (showToasts && shouldShowOperationToast(data.roomId || data.room_id, 'activated')) {
          console.log(`🍞 [useWebSocket] ${instanceId.current} - Mostrando toast activación`);
          toast.success(`✅ Sala ${data.roomName || data.room_name || data.roomId} activada`, {
            position: 'top-right',
            autoClose: 4000,
            toastId: `room-operation-${data.roomId || data.room_id}` // Un toast por operación
          });
        }
      }
    };

    const handleRoomDeactivated = (data) => {
      console.log(`🔴 [useWebSocket] ${instanceId.current} - handleRoomDeactivated:`, data);
      
      // Verificar duplicados
      if (isEventProcessed('room:deactivated', data)) {
        return;
      }
      
      console.log('  - Mounted:', mountedRef.current, 'showToasts:', showToasts);
      
      if (mountedRef.current) {
        const update = {
          type: 'room:deactivated',
          data,
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate:', update);
        setLastUpdate(update);
        
        if (showToasts && shouldShowOperationToast(data.roomId || data.room_id, 'deactivated')) {
          console.log(`🍞 [useWebSocket] ${instanceId.current} - Mostrando toast desactivación`);
          toast.warning(`🔴 Sala ${data.roomName || data.room_name || data.roomId} desactivada: ${data.reason}`, {
            position: 'top-right',
            autoClose: 5000,
            toastId: `room-operation-${data.roomId || data.room_id}` // Un toast por operación
          });
        }
      }
    };

    const handleRoomArchived = (data) => {
      if (mountedRef.current) {
        setLastUpdate({
          type: 'room:archived',
          data,
          timestamp: Date.now()
        });
        if (showToasts) {
          toast.info(`📦 Sala ${data.roomName} archivada`, {
            position: 'top-right',
            autoClose: 4000
          });
        }
      }
    };

    const handleRoomsListUpdated = (data) => {
      console.log('📋 [useWebSocket] handleRoomsListUpdated called:', data);
      console.log('  - Mounted:', mountedRef.current);
      
      if (mountedRef.current) {
        const update = {
          type: 'rooms:list:updated',
          data,
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate:', update);
        setLastUpdate(update);
      }
    };

    const handleGameStateUpdated = (data) => {
      if (mountedRef.current) {
        setLastUpdate({
          type: 'game:state:updated',
          data,
          timestamp: Date.now()
        });
      }
    };

    const handleCardsSoldUpdated = (data) => {
      console.log(`💳 [useWebSocket] ${instanceId.current} - handleCardsSoldUpdated:`, data);
      
      if (mountedRef.current) {
        const update = {
          type: 'cards:sold:updated',
          data,
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate:', update);
        setLastUpdate(update);
        
        if (showToasts && data.cards?.sold) {
          console.log(`🍞 [useWebSocket] ${instanceId.current} - Mostrando toast venta cartones`);
          toast.info(`💳 Sala ${data.roomName || data.roomId}: ${data.cards.sold} cartones vendidos`, {
            position: 'top-right',
            autoClose: 3000,
            toastId: `cards-sold-${data.roomId || data.room_id}-${Date.now()}`
          });
        }
      }
    };
    
    const handleRoomsList = (rooms) => {
      console.log(`📋 [useWebSocket] ${instanceId.current} - handleRoomsList:`, rooms?.length || 0, 'salas');
      
      if (mountedRef.current && Array.isArray(rooms)) {
        const update = {
          type: 'rooms:list:full',
          data: { rooms },
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate with full rooms data');
        setLastUpdate(update);
      }
    };
    
    const handleRoomInfo = (roomInfo) => {
      console.log(`🏠 [useWebSocket] ${instanceId.current} - handleRoomInfo:`, roomInfo);
      
      if (mountedRef.current && roomInfo) {
        const update = {
          type: 'room:info:update',
          data: roomInfo,
          timestamp: Date.now()
        };
        console.log('  - Setting lastUpdate with room info');
        setLastUpdate(update);
      }
    };

    // Registrar event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('reconnected', handleReconnected);
    websocketService.on('reconnecting', handleReconnecting);
    websocketService.on('error', handleError);
    websocketService.on('auth_error', handleAuthError);
    websocketService.on('unauthorized', handleUnauthorized);
    
    // Room events
    websocketService.on('roomStatusChanged', handleRoomStatusChanged);
    websocketService.on('roomActivated', handleRoomActivated);
    websocketService.on('roomDeactivated', handleRoomDeactivated);
    websocketService.on('roomArchived', handleRoomArchived);
    websocketService.on('roomsListUpdated', handleRoomsListUpdated);
    websocketService.on('gameStateUpdated', handleGameStateUpdated);
    websocketService.on('cardsSoldUpdated', handleCardsSoldUpdated);
    websocketService.on('roomsList', handleRoomsList);
    websocketService.on('roomInfo', handleRoomInfo);

    // Cleanup
    return () => {
      mountedRef.current = false;
      toast.dismiss('reconnecting');
      
      // Remover event listeners
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('reconnected', handleReconnected);
      websocketService.off('reconnecting', handleReconnecting);
      websocketService.off('error', handleError);
      websocketService.off('auth_error', handleAuthError);
      websocketService.off('unauthorized', handleUnauthorized);
      
      websocketService.off('roomStatusChanged', handleRoomStatusChanged);
      websocketService.off('roomActivated', handleRoomActivated);
      websocketService.off('roomDeactivated', handleRoomDeactivated);
      websocketService.off('roomArchived', handleRoomArchived);
      websocketService.off('roomsListUpdated', handleRoomsListUpdated);
      websocketService.off('gameStateUpdated', handleGameStateUpdated);
      websocketService.off('cardsSoldUpdated', handleCardsSoldUpdated);
      websocketService.off('roomsList', handleRoomsList);
      websocketService.off('roomInfo', handleRoomInfo);
      
      // No desconectar aquí porque otros componentes pueden estar usando el servicio
    };
  }, [isEventProcessed, showToasts]); // Dependencias necesarias

  // Métodos del WebSocket
  const activateRoom = useCallback(async (roomId, reason) => {
    try {
      const result = await websocketService.activateRoom(roomId, reason);
      return result;
    } catch (error) {
      if (showToasts) {
        toast.error(`Error al activar sala: ${error.message}`, {
          position: 'bottom-center',
          autoClose: 5000
        });
      }
      throw error;
    }
  }, [showToasts]);

  const deactivateRoom = useCallback(async (roomId, options) => {
    try {
      const result = await websocketService.deactivateRoom(roomId, options);
      return result;
    } catch (error) {
      if (showToasts) {
        toast.error(`Error al desactivar sala: ${error.message}`, {
          position: 'bottom-center',
          autoClose: 5000
        });
      }
      throw error;
    }
  }, [showToasts]);

  const scheduleDeactivation = useCallback(async (roomId, scheduledAt, reason) => {
    try {
      const result = await websocketService.scheduleDeactivation(roomId, scheduledAt, reason);
      return result;
    } catch (error) {
      if (showToasts) {
        toast.error(`Error al programar desactivación: ${error.message}`, {
          position: 'bottom-center',
          autoClose: 5000
        });
      }
      throw error;
    }
  }, [showToasts]);

  const getRoomsList = useCallback(async () => {
    try {
      const rooms = await websocketService.getRoomsList();
      return rooms;
    } catch (error) {
      console.error('Error obteniendo lista de salas:', error);
      throw error;
    }
  }, []);

  const monitorRoom = useCallback((roomId) => {
    websocketService.monitorRoom(roomId);
  }, []);

  const unmonitorRoom = useCallback((roomId) => {
    websocketService.unmonitorRoom(roomId);
  }, []);

  const getRoomStatus = useCallback(async (roomId) => {
    try {
      const status = await websocketService.getRoomStatus(roomId);
      return status;
    } catch (error) {
      console.error('Error obteniendo estado de sala:', error);
      throw error;
    }
  }, []);

  const resync = useCallback(async () => {
    try {
      const data = await websocketService.resync();
      if (showToasts) {
        toast.success('Datos sincronizados correctamente', {
          position: 'bottom-right',
          autoClose: 3000
        });
      }
      return data;
    } catch (error) {
      if (showToasts) {
        toast.error('Error al sincronizar datos', {
          position: 'bottom-right',
          autoClose: 5000
        });
      }
      throw error;
    }
  }, [showToasts]);

  return {
    // Estado
    connected,
    connecting,
    lastUpdate,
    error,
    
    // Métodos
    activateRoom,
    deactivateRoom,
    scheduleDeactivation,
    getRoomsList,
    getRoomInfo: websocketService.getRoomInfo.bind(websocketService),
    monitorRoom,
    unmonitorRoom,
    getRoomStatus,
    resync,
    
    // Utilidades
    isConnected: websocketService.isConnected(),
    socketId: websocketService.getSocketId()
  };
}