// Herramienta de depuración para eventos WebSocket en tiempo real
import websocketService from '@/services/websocketService';

class WebSocketDebugger {
  constructor() {
    this.eventLog = [];
    this.isMonitoring = false;
    this.socketEvents = [
      'room:status:changed',
      'room:activated', 
      'room:deactivated',
      'room:archived',
      'room:deactivating',
      'rooms:list:updated',
      'server:roomsList',
      'game:state:updated'
    ];
  }

  // Iniciar monitoreo directo del socket real
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Ya se está monitoreando');
      return;
    }

    if (!websocketService.socket) {
      console.error('❌ No hay conexión WebSocket activa');
      return;
    }

    console.log('🔍 Iniciando monitoreo de eventos WebSocket...');
    console.log('Socket ID:', websocketService.socket.id);
    console.log('Connected:', websocketService.socket.connected);
    this.isMonitoring = true;

    // Registrar listeners directamente en el socket
    this.socketEvents.forEach(eventName => {
      websocketService.socket.on(eventName, (data) => {
        const logEntry = {
          event: eventName,
          data: data,
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString()
        };
        
        this.eventLog.push(logEntry);
        
        console.log(`%c🎯 [SOCKET DIRECTO] ${eventName}`, 'color: #00ff00; font-weight: bold');
        console.log('Data:', data);
        console.log('---');
        
        // También verificar si el evento se propaga al EventEmitter
        this.checkEventPropagation(eventName);
      });
    });

    // También monitorear eventos del EventEmitter
    const emitterEvents = [
      'roomStatusChanged',
      'roomActivated',
      'roomDeactivated',
      'roomArchived',
      'roomDeactivating',
      'roomsListUpdated',
      'roomsList',
      'gameStateUpdated'
    ];

    emitterEvents.forEach(eventName => {
      websocketService.on(eventName, (data) => {
        console.log(`%c📢 [EMITTER] ${eventName}`, 'color: #ffff00; font-weight: bold');
        console.log('Data:', data);
      });
    });

    console.log('✅ Monitoreo iniciado. Eventos monitoreados:', this.socketEvents);
  }

  // Verificar si el evento se propaga correctamente
  checkEventPropagation(socketEventName) {
    // Mapeo de eventos socket a eventos emitter
    const eventMap = {
      'room:status:changed': 'roomStatusChanged',
      'room:activated': 'roomActivated',
      'room:deactivated': 'roomDeactivated',
      'room:archived': 'roomArchived',
      'room:deactivating': 'roomDeactivating',
      'rooms:list:updated': 'roomsListUpdated',
      'server:roomsList': 'roomsList',
      'game:state:updated': 'gameStateUpdated'
    };

    const emitterEventName = eventMap[socketEventName];
    if (emitterEventName) {
      const listeners = websocketService.listenerCount(emitterEventName);
      console.log(`📊 Listeners para ${emitterEventName}: ${listeners}`);
    }
  }

  // Detener monitoreo
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️ No se está monitoreando');
      return;
    }

    // Remover listeners del socket
    this.socketEvents.forEach(eventName => {
      websocketService.socket.removeAllListeners(eventName);
    });

    this.isMonitoring = false;
    console.log('⏹️ Monitoreo detenido');
  }

  // Ver log de eventos
  showEventLog() {
    console.log('📋 Log de eventos capturados:');
    console.table(this.eventLog.map(e => ({
      time: e.time,
      event: e.event,
      data: JSON.stringify(e.data).substring(0, 50) + '...'
    })));
  }

  // Limpiar log
  clearLog() {
    this.eventLog = [];
    console.log('🗑️ Log limpiado');
  }

  // Test de conexión y eventos
  testConnection() {
    console.group('🔌 Test de Conexión WebSocket');
    
    console.log('1. WebSocket Service:');
    console.log('   - Connected:', websocketService.connected);
    console.log('   - Socket exists:', !!websocketService.socket);
    
    if (websocketService.socket) {
      console.log('2. Socket.io Client:');
      console.log('   - ID:', websocketService.socket.id);
      console.log('   - Connected:', websocketService.socket.connected);
      console.log('   - Transport:', websocketService.socket.io.engine.transport.name);
      
      console.log('3. Event Listeners en Socket:');
      this.socketEvents.forEach(event => {
        const hasListeners = websocketService.socket.hasListeners(event);
        console.log(`   - ${event}: ${hasListeners ? '✅' : '❌'}`);
      });
    }
    
    console.log('4. Event Listeners en Service:');
    const serviceEvents = websocketService.eventNames();
    serviceEvents.forEach(event => {
      const count = websocketService.listenerCount(event);
      console.log(`   - ${event}: ${count} listeners`);
    });
    
    console.groupEnd();
  }

  // Enviar evento de prueba al servidor
  sendTestEvent() {
    if (!websocketService.socket || !websocketService.socket.connected) {
      console.error('❌ No hay conexión activa');
      return;
    }

    console.log('📤 Enviando evento de prueba backoffice:ping...');
    websocketService.socket.emit('backoffice:ping', { 
      timestamp: Date.now(),
      message: 'Test from debugger'
    }, (response) => {
      console.log('📥 Respuesta:', response);
    });
  }
}

// Crear instancia global
if (typeof window !== 'undefined') {
  window.wsdebug = new WebSocketDebugger();
  
  // console.log('%c🐛 WebSocket Debugger Loaded', 'color: #00ff00; font-size: 14px; font-weight: bold');
  // console.log('Comandos disponibles:');
  // console.log('  wsdebug.startMonitoring() - Iniciar monitoreo de eventos');
  // console.log('  wsdebug.stopMonitoring() - Detener monitoreo');
  // console.log('  wsdebug.showEventLog() - Ver eventos capturados');
  // console.log('  wsdebug.clearLog() - Limpiar log');
  // console.log('  wsdebug.testConnection() - Test completo de conexión');
  // console.log('  wsdebug.sendTestEvent() - Enviar evento de prueba');
}

export default WebSocketDebugger;