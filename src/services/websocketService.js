import { io } from 'socket.io-client';
import { EventEmitter } from 'events';
import Cookies from 'js-cookie';


class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(options = {}) {
    // Construir URL del WebSocket
    const wsPath = process.env.NEXT_PUBLIC_WS_SERVER_PATH || 'http://localhost:3002';
    const wsUri = process.env.NEXT_PUBLIC_WS_SERVER_URI || '/betjockey/bingo/socket.io';
    
    console.log('🔌 Conectando WebSocket a:', wsPath + wsUri);

    // Obtener tokens de las cookies
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    this.socket = io(wsPath, {
      path: wsUri,
      // Autenticación via cookies
      withCredentials: true,
      // Autenticación adicional via auth
      auth: {
        token: accessToken || refreshToken
      },
      // Configuración de reconexión
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      // Timeout de conexión
      timeout: 20000,
      // Transports (WebSocket primero, fallback a polling)
      transports: ['websocket', 'polling'],
      ...options
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
      console.log('Socket ID:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Test basic communication
      console.log('🧪 Testing WebSocket communication...');
      this.socket.emit('ping', (response) => {
        console.log('🏓 Ping response:', response);
      });
      
      // Solicitar estado inicial
      console.log('📤 Emitiendo backoffice:init');
      this.socket.emit('backoffice:init', (response) => {
        console.log('📥 Respuesta backoffice:init:', response);
      });
      
      // Solicitar lista de salas inicial usando client:roomsList
      console.log('📤 Solicitando lista de salas inicial con client:roomsList');
      
      // Intentar primero con client:roomsList
      let responseReceived = false;
      
      this.socket.emit('client:roomsList', (response) => {
        responseReceived = true;
        console.log('📥 [WebSocketService] Initial client:roomsList response:', {
          type: typeof response,
          isArray: Array.isArray(response),
          hasSuccess: response?.success,
          hasRooms: response?.rooms,
          responseKeys: response ? Object.keys(response) : null,
          fullResponse: response
        });
        
        if (response && response.success && response.rooms) {
          console.log('✅ Lista de salas recibida:', response.rooms.length, 'salas');
          this.emit('roomsList', response.rooms);
        } else if (Array.isArray(response)) {
          console.log('✅ Lista de salas recibida (array directo):', response.length, 'salas');
          this.emit('roomsList', response);
        } else {
          console.warn('⚠️ Respuesta inesperada de client:roomsList:', response);
        }
      });
      
      // Fallback: intentar con server:getRoomsList si no hay respuesta
      setTimeout(() => {
        if (!responseReceived) {
          console.log('⚠️ No response from client:roomsList, trying server:getRoomsList');
          this.socket.emit('server:getRoomsList', (rooms) => {
            console.log('📥 [WebSocketService] server:getRoomsList response:', rooms);
            if (Array.isArray(rooms)) {
              console.log('✅ Lista de salas recibida (server:getRoomsList):', rooms.length, 'salas');
              this.emit('roomsList', rooms);
            }
          });
        }
      }, 1000);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado del servidor:', reason);
      this.connected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
      this.reconnectAttempts = attemptNumber;
      this.emit('reconnected', attemptNumber);
      
      // Solicitar sincronización completa
      this.socket.emit('backoffice:resync');
      
      // Solicitar lista de salas actualizada
      this.socket.emit('client:roomsList', (response) => {
        if (response && response.success && response.rooms) {
          console.log('📥 Lista de salas recibida tras reconexión:', response.rooms.length, 'salas');
          this.emit('roomsList', response.rooms);
        }
      });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Intento de reconexión #', attemptNumber);
      this.emit('reconnecting', attemptNumber);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      this.emit('error', error);
      
      // Si es error de autenticación, intentar renovar token
      if (error.type === 'auth' || error.message.includes('unauthorized')) {
        this.emit('auth_error', error);
      }
    });

    // Eventos de estado de salas
    this.socket.on('room:status:changed', (data) => {
      console.log('🏠 [WebSocket] Estado de sala cambiado:', data);
      console.log('  - Room ID:', data.roomId || data.room_id);
      console.log('  - Previous Status:', data.previousStatus);
      console.log('  - New Status:', data.newStatus);
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomStatusChanged', data);
    });

    this.socket.on('room:activated', (data) => {
      console.log('🟢 [WebSocket] Sala activada:', data);
      console.log('  - Room ID:', data.roomId || data.room_id);
      console.log('  - Room Name:', data.roomName || data.room_name);
      console.log('  - Status:', data.status);
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomActivated', data);
    });

    this.socket.on('room:deactivated', (data) => {
      console.log('🔴 [WebSocket] Sala desactivada:', data);
      console.log('  - Room ID:', data.roomId || data.room_id);
      console.log('  - Room Name:', data.roomName || data.room_name);
      console.log('  - Reason:', data.reason);
      console.log('  - Final Status:', data.finalStatus);
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomDeactivated', data);
    });

    this.socket.on('room:archived', (data) => {
      console.log('📦 [WebSocket] Sala archivada:', data);
      console.log('  - Room ID:', data.roomId || data.room_id);
      console.log('  - Room Name:', data.roomName || data.room_name);
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomArchived', data);
    });

    this.socket.on('room:deactivating', (data) => {
      console.log('⏳ [WebSocket] Sala en proceso de desactivación:', data);
      console.log('  - Room ID:', data.roomId || data.room_id);
      console.log('  - Room Name:', data.roomName || data.room_name);
      console.log('  - Scheduled At:', data.scheduledAt);
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomDeactivating', data);
    });

    // Eventos de lista de salas
    this.socket.on('rooms:list:updated', (data) => {
      console.log('📋 [WebSocket] Lista de salas actualizada:', data);
      console.log('  - Update Type:', data.type || 'general');
      console.log('  - Affected Rooms:', data.affectedRooms || 'all');
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomsListUpdated', data);
    });

    this.socket.on('server:roomsList', (rooms) => {
      console.log('📋 [WebSocket] Lista completa de salas recibida:', rooms.length, 'salas');
      console.log('  - Room IDs:', rooms.map(r => r.room_id || r.roomId).join(', '));
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('roomsList', rooms);
    });
    
    // Evento para información individual de sala
    this.socket.on('server:roomInfo', (roomInfo) => {
      console.log('🏠 [WebSocket] Información de sala recibida:', roomInfo);
      if (roomInfo && roomInfo.host) {
        console.log('  - Room Name:', roomInfo.host.name);
        console.log('  - Room ID:', roomInfo.host.gameURI?.split('/').pop());
        console.log('  - Users:', roomInfo.host.users?.length || 0);
        console.log('  - Game Status:', roomInfo.game?.status);
      }
      this.emit('roomInfo', roomInfo);
    });

    // Eventos de estado de juegos
    this.socket.on('game:state:updated', (data) => {
      console.log('🎮 [WebSocket] Estado del juego actualizado:', data);
      console.log('  - Game ID:', data.gameId || data.game_id);
      console.log('  - Room ID:', data.roomId || data.room_id);
      console.log('  - State:', data.state);
      console.log('  - Mapped State:', data.mappedState);
      console.log('  - Timestamp:', new Date().toISOString());
      this.emit('gameStateUpdated', data);
    });

    // Eventos de autenticación
    this.socket.on('token:refresh:required', () => {
      console.log('🔑 Renovación de token requerida');
      this.emit('tokenRefreshRequired');
    });

    this.socket.on('unauthorized', (error) => {
      console.error('🚫 No autorizado:', error);
      this.emit('unauthorized', error);
    });

    // DEBUG: Capturar TODOS los eventos (ACTIVADO TEMPORALMENTE)
    if (process.env.NODE_ENV === 'development') {
      this.socket.onAny((eventName, ...args) => {
        // Ignorar eventos de ping/pong
        if (eventName === 'ping' || eventName === 'pong') {
          return;
        }
        
        console.log('%c🎯 [ANY EVENT] ' + eventName, 'color: #ff00ff; font-weight: bold');
        console.log('Arguments:', args);
        
        // Log específico para eventos de salas
        if (eventName.includes('room') || eventName.includes('Room')) {
          console.log('%c📋 Room-related event detected!', 'color: #00ff00; font-weight: bold');
        }
      });
      
      console.log('📡 Listener para TODOS los eventos activado (ping/pong ignorados)');
    }
  }

  // Métodos de emisión con promesas

  requestInitialState() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout solicitando estado inicial'));
      }, 5000);

      this.socket.emit('backoffice:init', (response) => {
        clearTimeout(timeout);
        if (response && response.success !== false) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Error obteniendo estado inicial'));
        }
      });
    });
  }

  getRoomsList() {
    return new Promise((resolve, reject) => {
      // Verificar conexión primero
      if (!this.socket || !this.connected) {
        console.error('❌ [WebSocketService] getRoomsList - Socket no conectado');
        reject(new Error('WebSocket no conectado'));
        return;
      }
      
      console.log('📤 [WebSocketService] getRoomsList - Emitiendo client:roomsList');
      
      const timeout = setTimeout(() => {
        console.error('⏱️ [WebSocketService] getRoomsList - Timeout alcanzado (5s)');
        reject(new Error('Timeout obteniendo lista de salas'));
      }, 5000);

      // Track if we got a response
      let gotResponse = false;
      
      // Usar client:roomsList según el documento
      this.socket.emit('client:roomsList', (response) => {
        if (gotResponse) return; // Avoid duplicate responses
        gotResponse = true;
        clearTimeout(timeout);
        
        // Log detallado de la respuesta
        console.log('📥 [WebSocketService] getRoomsList client:roomsList response:', {
          type: typeof response,
          isArray: Array.isArray(response),
          hasSuccess: response?.success,
          hasRooms: response?.rooms,
          responseKeys: response ? Object.keys(response) : null,
          fullResponse: response
        });
        
        if (response && response.success && Array.isArray(response.rooms)) {
          console.log('✅ [WebSocketService] Rooms array found in response.rooms');
          resolve(response.rooms);
        } else if (Array.isArray(response)) {
          // Fallback si la respuesta es directamente un array
          console.log('✅ [WebSocketService] Response is directly an array');
          resolve(response);
        } else {
          console.error('❌ [WebSocketService] Invalid response format from client:roomsList');
          // Try fallback
          tryFallback();
        }
      });
      
      // Fallback after 1 second if no response
      const fallbackTimeout = setTimeout(() => {
        if (!gotResponse) {
          console.warn('⚠️ [WebSocketService] No response from client:roomsList, trying fallback');
          tryFallback();
        }
      }, 1000);
      
      const tryFallback = () => {
        if (gotResponse) return;
        
        console.log('📤 [WebSocketService] Trying server:getRoomsList as fallback');
        
        // Try different event names
        const eventNames = ['server:getRoomsList', 'getRoomsList', 'rooms:list', 'backoffice:rooms:list'];
        let eventIndex = 0;
        
        const tryNextEvent = () => {
          if (gotResponse || eventIndex >= eventNames.length) {
            if (!gotResponse) {
              console.error('❌ [WebSocketService] All event names failed');
              reject(new Error('No se pudo obtener la lista de salas - ningún evento respondió'));
            }
            return;
          }
          
          const eventName = eventNames[eventIndex];
          console.log(`🔍 [WebSocketService] Trying event: ${eventName}`);
          
          this.socket.emit(eventName, (response) => {
            if (gotResponse) return;
            
            console.log(`📥 [WebSocketService] Response from ${eventName}:`, response);
            
            if (Array.isArray(response)) {
              gotResponse = true;
              clearTimeout(timeout);
              clearTimeout(fallbackTimeout);
              console.log(`✅ [WebSocketService] Rooms received from ${eventName}`);
              resolve(response);
            } else if (response && response.rooms && Array.isArray(response.rooms)) {
              gotResponse = true;
              clearTimeout(timeout);
              clearTimeout(fallbackTimeout);
              console.log(`✅ [WebSocketService] Rooms received from ${eventName} (in response.rooms)`);
              resolve(response.rooms);
            } else {
              console.warn(`⚠️ [WebSocketService] Invalid response from ${eventName}`);
              eventIndex++;
              setTimeout(tryNextEvent, 100);
            }
          });
          
          // Try next event after 500ms if no response
          setTimeout(() => {
            if (!gotResponse) {
              eventIndex++;
              tryNextEvent();
            }
          }, 500);
        };
        
        tryNextEvent();
      };
    });
  }
  
  // Método adicional para solicitar lista de salas
  requestRoomsList() {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Socket no conectado, no se puede solicitar lista de salas');
      return;
    }
    
    this.socket.emit('client:roomsList', (response) => {
      if (response && response.success && response.rooms) {
        console.log('📋 [WebSocket] Lista de salas recibida:', response.rooms.length, 'salas');
        this.emit('roomsList', response.rooms);
      }
    });
  }

  activateRoom(roomId, reason) {
    return new Promise((resolve, reject) => {
      if (!roomId) {
        reject(new Error('roomId es requerido'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout activando sala'));
      }, 10000);

      this.socket.emit('backoffice:room:activate', {
        roomId,
        reason: reason || 'Activación manual desde backoffice'
      }, (response) => {
        clearTimeout(timeout);
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Error al activar sala'));
        }
      });
    });
  }

  deactivateRoom(roomId, options = {}) {
    return new Promise((resolve, reject) => {
      if (!roomId) {
        reject(new Error('roomId es requerido'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout desactivando sala'));
      }, 10000);

      this.socket.emit('backoffice:room:deactivate', {
        roomId,
        immediate: options.immediate || false,
        reason: options.reason || 'Desactivación manual desde backoffice'
      }, (response) => {
        clearTimeout(timeout);
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Error al desactivar sala'));
        }
      });
    });
  }

  scheduleDeactivation(roomId, scheduledAt, reason) {
    return new Promise((resolve, reject) => {
      if (!roomId || !scheduledAt) {
        reject(new Error('roomId y scheduledAt son requeridos'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout programando desactivación'));
      }, 10000);

      this.socket.emit('backoffice:room:schedule-deactivation', {
        roomId,
        scheduledAt,
        reason: reason || 'Desactivación programada desde backoffice'
      }, (response) => {
        clearTimeout(timeout);
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Error al programar desactivación'));
        }
      });
    });
  }

  monitorRoom(roomId) {
    if (!roomId) return;
    
    this.socket.emit('backoffice:monitor:room', { roomId });
    console.log('👁️ Monitoreando sala:', roomId);
  }

  unmonitorRoom(roomId) {
    if (!roomId) return;
    
    this.socket.emit('backoffice:unmonitor:room', { roomId });
    console.log('👁️‍🗨️ Dejando de monitorear sala:', roomId);
  }

  getRoomStatus(roomId) {
    return new Promise((resolve, reject) => {
      if (!roomId) {
        reject(new Error('roomId es requerido'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout obteniendo estado de sala'));
      }, 5000);

      this.socket.emit('backoffice:room:status', {
        roomId
      }, (status) => {
        clearTimeout(timeout);
        if (status) {
          resolve(status);
        } else {
          reject(new Error('No se pudo obtener el estado de la sala'));
        }
      });
    });
  }
  
  getRoomInfo(roomId) {
    return new Promise((resolve, reject) => {
      if (!roomId) {
        reject(new Error('roomId es requerido'));
        return;
      }
      
      if (!this.socket || !this.connected) {
        reject(new Error('WebSocket no conectado'));
        return;
      }

      console.log(`📋 [WebSocketService] getRoomInfo - Requesting info for room ${roomId}`);

      const timeout = setTimeout(() => {
        reject(new Error('Timeout obteniendo información de sala'));
      }, 5000);

      // Try server:getRoomInfo based on the log you provided
      this.socket.emit('server:getRoomInfo', roomId, (response) => {
        clearTimeout(timeout);
        
        console.log(`📥 [WebSocketService] getRoomInfo response:`, response);
        
        if (response) {
          resolve(response);
        } else {
          reject(new Error('No se pudo obtener información de la sala'));
        }
      });
    });
  }

  resync() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout resincronizando'));
      }, 10000);

      this.socket.emit('backoffice:resync', (data) => {
        clearTimeout(timeout);
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Error resincronizando'));
        }
      });
    });
  }

  updateAuthToken(token) {
    if (this.socket && token) {
      this.socket.auth.token = token;
      // Reconectar con nuevo token
      this.socket.disconnect().connect();
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket?.id || null;
  }
  
  // Debug method to test available events
  debugAvailableEvents() {
    if (!this.socket || !this.connected) {
      console.error('Socket not connected');
      return;
    }
    
    console.log('🔍 Testing available WebSocket events...');
    
    // Common event patterns
    const testEvents = [
      'client:roomsList',
      'server:roomsList',
      'backoffice:getRoomsList',
      'getRoomsList',
      'rooms:list',
      'rooms:get',
      'rooms',
      'listRooms',
      'room:list',
      'backoffice:rooms',
      'admin:rooms:list'
    ];
    
    testEvents.forEach((eventName, index) => {
      setTimeout(() => {
        console.log(`🧪 Testing event: ${eventName}`);
        this.socket.emit(eventName, (response) => {
          if (response !== undefined) {
            console.log(`✅ ${eventName} RESPONDED:`, response);
          }
        });
      }, index * 200); // Stagger requests
    });
  }
}

// Singleton
const websocketService = new WebSocketService();

// DEBUG: Expose to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.websocketService = websocketService;
  console.log('💡 WebSocket service exposed to window.websocketService for debugging');
  console.log('   Try: window.websocketService.debugAvailableEvents()');
}

export default websocketService;