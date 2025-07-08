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
    
    // Check if already connected
    if (this.socket && this.connected) {
      return this.socket;
    }
    
    // Construir URL del WebSocket
    const wsPath = process.env.NEXT_PUBLIC_WS_SERVER_PATH || 'http://localhost:3002';
    const wsUri = process.env.NEXT_PUBLIC_WS_SERVER_URI || '/betjockey/bingo/socket.io';
    

    // Note: We can't check HttpOnly cookies from JavaScript
    // The WebSocketProvider should have already verified auth via API

    this.socket = io(wsPath, {
      path: wsUri,
      // Autenticación via cookies HttpOnly
      withCredentials: true,
      // No podemos enviar token en auth porque las cookies son HttpOnly
      // El servidor debe leer las cookies directamente
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
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // IMPORTANT: Authenticate first before any other events
      
      // Get username from cookie
      const username = Cookies.get('username');
      
      if (!username) {
        this.emit('auth_error', { error: 'No username found' });
        return;
      }
      
      
      // El servidor espera el username como string, no como objeto
      this.socket.emit('auth', username);
      
      // Escuchar eventos de autenticación según el documento
      this.socket.once('auth_success', (data) => {
        
        // Now we can proceed with other initialization
        // Test basic communication
        this.socket.emit('ping', (response) => {
        });
        
        // Solicitar estado inicial
        this.socket.emit('backoffice:init', (response) => {
        });
        
        // Solicitar lista de salas inicial usando client:roomsList
        
        // Intentar primero con client:roomsList
        let responseReceived = false;
        
        this.socket.emit('client:roomsList', (response) => {
          responseReceived = true;
          
          if (response && response.success && response.rooms) {
            this.emit('roomsList', response.rooms);
          } else if (Array.isArray(response)) {
            this.emit('roomsList', response);
          } else {
          }
        });
        
        // Fallback: intentar con server:getRoomsList si no hay respuesta
        setTimeout(() => {
          if (!responseReceived) {
            this.socket.emit('server:getRoomsList', (rooms) => {
              if (Array.isArray(rooms)) {
                this.emit('roomsList', rooms);
              }
            });
          }
        }, 1000);
      });
      
      this.socket.once('auth_error', (error) => {
        this.emit('auth_error', error);
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      this.emit('reconnected', attemptNumber);
      
      // Re-authenticate after reconnection
      
      // Get username from cookie
      const username = Cookies.get('username');
      
      if (!username) {
        this.emit('auth_error', { error: 'No username found' });
        return;
      }
      
      // El servidor espera el username como string, no como objeto
      this.socket.emit('auth', username);
      
      this.socket.once('auth_success', (data) => {
        
        // Solicitar sincronización completa
        this.socket.emit('backoffice:resync');
        
        // Solicitar lista de salas actualizada
        this.socket.emit('client:roomsList', (response) => {
          if (response && response.success && response.rooms) {
            this.emit('roomsList', response.rooms);
          }
        });
      });
      
      this.socket.once('auth_error', (error) => {
        this.emit('auth_error', error);
      });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.emit('reconnecting', attemptNumber);
    });

    this.socket.on('connect_error', (error) => {
      this.emit('error', error);
      
      // Si es error de autenticación, intentar renovar token
      if (error.type === 'auth' || error.message.includes('unauthorized')) {
        this.emit('auth_error', error);
      }
    });

    // Eventos de estado de salas
    this.socket.on('room:status:changed', (data) => {
      this.emit('roomStatusChanged', data);
    });

    this.socket.on('room:activated', (data) => {
      this.emit('roomActivated', data);
    });

    this.socket.on('room:deactivated', (data) => {
      this.emit('roomDeactivated', data);
    });

    this.socket.on('room:archived', (data) => {
      this.emit('roomArchived', data);
    });

    this.socket.on('room:deactivating', (data) => {
      this.emit('roomDeactivating', data);
    });

    // Eventos de lista de salas
    this.socket.on('rooms:list:updated', (data) => {
      this.emit('roomsListUpdated', data);
    });

    this.socket.on('server:roomsList', (rooms) => {
      this.emit('roomsList', rooms);
    });
    
    // Evento para información individual de sala
    this.socket.on('server:roomInfo', (roomInfo) => {
      this.emit('roomInfo', roomInfo);
    });

    // Eventos de estado de juegos
    this.socket.on('game:state:updated', (data) => {
      this.emit('gameStateUpdated', data);
    });

    // Eventos de autenticación
    this.socket.on('token:refresh:required', () => {
      this.emit('tokenRefreshRequired');
    });

    this.socket.on('unauthorized', (error) => {
      this.emit('unauthorized', error);
    });

    // DEBUG: Capturar TODOS los eventos (ACTIVADO TEMPORALMENTE)
    if (process.env.NODE_ENV === 'development') {
      this.socket.onAny((eventName, ...args) => {
        // Ignorar eventos de ping/pong
        if (eventName === 'ping' || eventName === 'pong') {
          return;
        }
        
      });
      
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
        reject(new Error('WebSocket no conectado'));
        return;
      }
      
      
      const timeout = setTimeout(() => {
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
        
        if (response && response.success && Array.isArray(response.rooms)) {
          resolve(response.rooms);
        } else if (Array.isArray(response)) {
          // Fallback si la respuesta es directamente un array
          resolve(response);
        } else {
          // Try fallback
          tryFallback();
        }
      });
      
      // Fallback after 1 second if no response
      const fallbackTimeout = setTimeout(() => {
        if (!gotResponse) {
          tryFallback();
        }
      }, 1000);
      
      const tryFallback = () => {
        if (gotResponse) return;
        
        
        // Try different event names
        const eventNames = ['server:getRoomsList', 'getRoomsList', 'rooms:list', 'backoffice:rooms:list'];
        let eventIndex = 0;
        
        const tryNextEvent = () => {
          if (gotResponse || eventIndex >= eventNames.length) {
            if (!gotResponse) {
              reject(new Error('No se pudo obtener la lista de salas - ningún evento respondió'));
            }
            return;
          }
          
          const eventName = eventNames[eventIndex];
          
          this.socket.emit(eventName, (response) => {
            if (gotResponse) return;
            
            
            if (Array.isArray(response)) {
              gotResponse = true;
              clearTimeout(timeout);
              clearTimeout(fallbackTimeout);
              resolve(response);
            } else if (response && response.rooms && Array.isArray(response.rooms)) {
              gotResponse = true;
              clearTimeout(timeout);
              clearTimeout(fallbackTimeout);
              resolve(response.rooms);
            } else {
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
      return;
    }
    
    this.socket.emit('client:roomsList', (response) => {
      if (response && response.success && response.rooms) {
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
  }

  unmonitorRoom(roomId) {
    if (!roomId) return;
    
    this.socket.emit('backoffice:unmonitor:room', { roomId });
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
  
  getRoomInfo(roomId, roomStatus = null) {
    return new Promise((resolve, reject) => {
      if (!roomId) {
        reject(new Error('roomId es requerido'));
        return;
      }
      
      // Prevent calls for archived rooms
      if (roomStatus === 'archive' || roomStatus === 'archived') {
        reject(new Error('Cannot get info for archived room'));
        return;
      }
      
      if (!this.socket || !this.connected) {
        reject(new Error('WebSocket no conectado'));
        return;
      }


      const timeout = setTimeout(() => {
        reject(new Error('Timeout obteniendo información de sala'));
      }, 5000);

      // Use emitWithAck as per the example
      this.socket.emitWithAck('client:getRoomInfo', {
        room: roomId,
      })
      .then((response) => {
        clearTimeout(timeout);
        
        
        if (response) {
          resolve(response);
        } else {
          reject(new Error('No se pudo obtener información de la sala'));
        }
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
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
      return;
    }
    
    
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
        this.socket.emit(eventName, (response) => {
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
}

export default websocketService;