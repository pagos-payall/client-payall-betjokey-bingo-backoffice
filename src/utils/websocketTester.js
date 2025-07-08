// Herramienta para probar diferentes configuraciones de WebSocket
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

class WebSocketTester {
  constructor() {
    this.testSockets = [];
  }

  // Probar diferentes configuraciones de conexión
  testConfigurations() {
    console.log('🧪 Probando diferentes configuraciones de WebSocket...\n');

    const configs = [
      {
        name: 'Config 1: Puerto 3002 con path completo',
        url: 'http://localhost:3002',
        options: {
          path: '/betjockey/bingo/socket.io',
          withCredentials: true,
          transports: ['websocket', 'polling']
        }
      },
      {
        name: 'Config 2: Puerto 3001 (API)',
        url: 'http://localhost:3001',
        options: {
          path: '/betjockey/bingo/socket.io',
          withCredentials: true,
          transports: ['websocket', 'polling']
        }
      },
      {
        name: 'Config 3: Puerto 3002 sin path',
        url: 'http://localhost:3002',
        options: {
          withCredentials: true,
          transports: ['websocket', 'polling']
        }
      },
      {
        name: 'Config 4: Puerto 3002 con auth token',
        url: 'http://localhost:3002',
        options: {
          path: '/betjockey/bingo/socket.io',
          auth: {
            token: Cookies.get('access_token') || Cookies.get('refresh_token')
          },
          withCredentials: true,
          transports: ['websocket', 'polling']
        }
      }
    ];

    configs.forEach((config, index) => {
      console.log(`\n🔌 Probando ${config.name}...`);
      
      const socket = io(config.url, config.options);
      this.testSockets.push(socket);

      socket.on('connect', () => {
        console.log(`✅ ${config.name}: CONECTADO`);
        console.log(`   Socket ID: ${socket.id}`);
        console.log(`   Transport: ${socket.io.engine.transport.name}`);
        
        // Probar eventos
        this.testEvents(socket, config.name);
      });

      socket.on('connect_error', (error) => {
        console.error(`❌ ${config.name}: ERROR - ${error.message}`);
      });

      // Timeout de 5 segundos
      setTimeout(() => {
        if (!socket.connected) {
          console.log(`⏱️ ${config.name}: TIMEOUT`);
          socket.disconnect();
        }
      }, 5000);
    });
  }

  // Probar eventos en un socket conectado
  testEvents(socket, configName) {
    console.log(`\n📡 Probando eventos para ${configName}...`);

    // Registrar listeners para eventos esperados
    const events = [
      'room:status:changed',
      'room:activated',
      'room:deactivated',
      'room:archived',
      'rooms:list:updated',
      'server:roomsList'
    ];

    events.forEach(eventName => {
      socket.on(eventName, (data) => {
        console.log(`🎯 ${configName} - Evento recibido: ${eventName}`);
        console.log('   Data:', data);
      });
    });

    // Emitir eventos de prueba
    console.log(`📤 ${configName} - Emitiendo backoffice:init...`);
    socket.emit('backoffice:init', (response) => {
      console.log(`📥 ${configName} - Respuesta init:`, response);
    });

    console.log(`📤 ${configName} - Solicitando lista de salas...`);
    socket.emit('server:getRoomsList', (rooms) => {
      console.log(`📥 ${configName} - Salas recibidas:`, rooms ? rooms.length : 'null');
    });

    // Probar suscripción a sala específica
    console.log(`📤 ${configName} - Suscribiendo a eventos de todas las salas...`);
    socket.emit('backoffice:subscribe:all-rooms', (response) => {
      console.log(`📥 ${configName} - Respuesta suscripción:`, response);
    });
  }

  // Limpiar conexiones
  cleanup() {
    console.log('\n🧹 Cerrando todas las conexiones de prueba...');
    this.testSockets.forEach(socket => {
      if (socket.connected) {
        socket.disconnect();
      }
    });
    this.testSockets = [];
  }

  // Probar namespace específico
  testNamespace() {
    console.log('🔍 Probando diferentes namespaces...\n');

    const namespaces = [
      '/betjockey/bingo',
      '/bingo',
      '/backoffice',
      '/'
    ];

    namespaces.forEach(ns => {
      const socket = io(`http://localhost:3002${ns}`, {
        path: '/betjockey/bingo/socket.io',
        withCredentials: true
      });

      socket.on('connect', () => {
        console.log(`✅ Namespace ${ns}: CONECTADO`);
        socket.disconnect();
      });

      socket.on('connect_error', (error) => {
        console.log(`❌ Namespace ${ns}: ERROR - ${error.message}`);
      });
    });
  }
}

// Crear instancia global
if (typeof window !== 'undefined') {
  window.wstest2 = new WebSocketTester();
  
  // console.log('%c🔬 WebSocket Tester Loaded', 'color: #00ff00; font-size: 14px; font-weight: bold');
  // console.log('Comandos disponibles:');
  // console.log('  wstest2.testConfigurations() - Probar diferentes configuraciones');
  // console.log('  wstest2.testNamespace() - Probar diferentes namespaces');
  // console.log('  wstest2.cleanup() - Cerrar todas las conexiones de prueba');
}

export default WebSocketTester;