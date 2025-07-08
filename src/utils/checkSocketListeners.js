// Utilidad para verificar qué eventos están siendo escuchados
import websocketService from '@/services/websocketService';

function checkSocketListeners() {
  console.group('🔍 Verificando Event Listeners del Socket');
  
  if (!websocketService.socket) {
    console.error('❌ No hay socket conectado');
    console.groupEnd();
    return;
  }

  const socket = websocketService.socket;
  
  // Lista de eventos que esperamos escuchar
  const expectedEvents = [
    // Conexión
    'connect',
    'disconnect',
    'reconnect',
    'reconnect_attempt',
    'connect_error',
    
    // Estado de salas
    'room:status:changed',
    'room:activated',
    'room:deactivated',
    'room:archived',
    'room:deactivating',
    
    // Lista de salas
    'rooms:list:updated',
    'server:roomsList',
    
    // Juegos
    'game:state:updated',
    
    // Autenticación
    'token:refresh:required',
    'unauthorized'
  ];

  console.log('📋 Eventos esperados vs registrados:\n');
  
  expectedEvents.forEach(eventName => {
    const hasListeners = socket.hasListeners(eventName);
    const listenerCount = socket.listenerCount(eventName);
    
    if (hasListeners) {
      console.log(`✅ ${eventName}: ${listenerCount} listener(s)`);
    } else {
      console.log(`❌ ${eventName}: NO REGISTRADO`);
    }
  });

  // Ver todos los eventos registrados
  console.log('\n📡 Todos los eventos con listeners:');
  const allEvents = socket.eventNames();
  allEvents.forEach(event => {
    if (!expectedEvents.includes(event)) {
      console.log(`❓ ${event}: ${socket.listenerCount(event)} listener(s) (no esperado)`);
    }
  });

  console.log('\n📊 Resumen:');
  console.log(`- Total eventos esperados: ${expectedEvents.length}`);
  console.log(`- Total eventos registrados: ${allEvents.length}`);
  console.log(`- Socket conectado: ${socket.connected}`);
  console.log(`- Socket ID: ${socket.id}`);

  console.groupEnd();
}

// Función para emitir un evento de prueba
function emitTestEvent() {
  if (!websocketService.socket || !websocketService.socket.connected) {
    console.error('❌ Socket no conectado');
    return;
  }

  console.log('📤 Emitiendo evento de prueba: backoffice:test');
  websocketService.socket.emit('backoffice:test', {
    timestamp: Date.now(),
    message: 'Test event from frontend'
  }, (response) => {
    console.log('📥 Respuesta del servidor:', response);
  });
}

// Función para solicitar eventos de prueba del servidor
function requestServerTest() {
  if (!websocketService.socket || !websocketService.socket.connected) {
    console.error('❌ Socket no conectado');
    return;
  }

  console.log('📤 Solicitando al servidor que emita eventos de prueba...');
  websocketService.socket.emit('backoffice:request-test-events', {}, (response) => {
    console.log('📥 Respuesta:', response);
  });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.checkSocketListeners = checkSocketListeners;
  window.emitTestEvent = emitTestEvent;
  window.requestServerTest = requestServerTest;
  
  // console.log('🔧 Socket Listener Checker cargado:');
  // console.log('  checkSocketListeners() - Ver todos los listeners');
  // console.log('  emitTestEvent() - Emitir evento de prueba');
  // console.log('  requestServerTest() - Solicitar eventos de prueba del servidor');
}

export { checkSocketListeners, emitTestEvent, requestServerTest };