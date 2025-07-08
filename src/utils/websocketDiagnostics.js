// Herramienta de diagnóstico para WebSocket
import websocketService from '@/services/websocketService';

class WebSocketDiagnostics {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  log(message, data = null) {
    const entry = {
      timestamp: Date.now() - this.startTime,
      message,
      data,
      time: new Date().toLocaleTimeString()
    };
    this.logs.push(entry);
    console.log(`[WS Diag ${entry.time}] ${message}`, data || '');
  }

  async diagnoseConnection() {
    console.group('🔍 WebSocket Connection Diagnostics');
    
    // 1. Check environment variables
    console.log('📋 Environment Configuration:');
    console.log('- WS Path:', process.env.NEXT_PUBLIC_WS_SERVER_PATH || 'Not set (default: http://localhost:3002)');
    console.log('- WS URI:', process.env.NEXT_PUBLIC_WS_SERVER_URI || 'Not set (default: /betjockey/bingo/socket.io)');
    console.log('- Use Mock:', process.env.NEXT_PUBLIC_USE_MOCK_WEBSOCKET || 'Not set (default: false)');
    
    // 2. Check WebSocket service state
    console.log('\n📊 WebSocket Service State:');
    console.log('- Connected:', websocketService.connected);
    console.log('- Socket exists:', !!websocketService.socket);
    console.log('- Socket ID:', websocketService.getSocketId() || 'N/A');
    
    // 3. Check socket details
    console.log('\n📊 Socket Details:');
    if (websocketService.socket) {
      console.log('- Transport:', websocketService.socket.io?.engine?.transport?.name || 'N/A');
      console.log('- Polling:', websocketService.socket.io?.engine?.polling || false);
    }
    
    // 4. Test connection
    console.log('\n🔌 Testing Connection:');
    if (!websocketService.connected) {
      console.log('❌ Not connected. Attempting to connect...');
      
      // Listen for connection events
      const connectionPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 5 seconds'));
        }, 5000);
        
        websocketService.once('connected', () => {
          clearTimeout(timeout);
          resolve('Connected successfully');
        });
        
        websocketService.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      try {
        websocketService.connect();
        const result = await connectionPromise;
        console.log('✅', result);
      } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('💡 Tip: Check if the WebSocket server is running on port 3002');
      }
    } else {
      console.log('✅ Already connected');
    }
    
    // 5. Event listeners check
    console.log('\n📡 Event Listeners:');
    console.log('- Registered events:', websocketService.eventNames());
    console.log('- Listener count:', websocketService.listenerCount('connected'));
    
    console.groupEnd();
    
    return {
      config: {
        wsPath: process.env.NEXT_PUBLIC_WS_SERVER_PATH,
        wsUri: process.env.NEXT_PUBLIC_WS_SERVER_URI
      },
      state: {
        connected: websocketService.connected,
        socketId: websocketService.getSocketId()
      },
      logs: this.logs
    };
  }


  monitorEvents(duration = 10000) {
    console.group(`📊 Monitoring WebSocket events for ${duration/1000} seconds...`);
    
    const events = [];
    const handlers = {};
    
    // Events to monitor
    const eventNames = [
      'connected', 'disconnected', 'error', 'reconnecting',
      'roomStatusChanged', 'roomActivated', 'roomDeactivated',
      'roomArchived', 'roomsListUpdated', 'gameStateUpdated'
    ];
    
    // Register handlers
    eventNames.forEach(eventName => {
      handlers[eventName] = (data) => {
        const event = {
          type: eventName,
          data,
          timestamp: new Date().toLocaleTimeString()
        };
        events.push(event);
        console.log(`📨 ${eventName}:`, data);
      };
      websocketService.on(eventName, handlers[eventName]);
    });
    
    // Clean up after duration
    setTimeout(() => {
      // Remove handlers
      eventNames.forEach(eventName => {
        websocketService.off(eventName, handlers[eventName]);
      });
      
      console.log(`\n📋 Summary: ${events.length} events captured`);
      console.table(events);
      console.groupEnd();
    }, duration);
    
    console.log('Monitoring started. Perform actions to see events...');
  }
}

// Crear instancia global para debugging
if (typeof window !== 'undefined') {
  window.wsdiag = new WebSocketDiagnostics();
  
  // WebSocket diagnostics available at window.wsdiag
}

export default WebSocketDiagnostics;