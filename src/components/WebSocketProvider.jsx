'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const websocket = useWebSocket(true); // Solo el provider muestra toasts

  useEffect(() => {
    console.log('🌐 [WebSocketProvider] Estado de conexión:', {
      connected: websocket.connected,
      connecting: websocket.connecting,
      socketId: websocket.socketId
    });
  }, [websocket.connected, websocket.connecting, websocket.socketId]);

  useEffect(() => {
    if (websocket.lastUpdate) {
      console.log('📨 [WebSocketProvider] New update detected:', {
        type: websocket.lastUpdate.type,
        data: websocket.lastUpdate.data,
        timestamp: new Date(websocket.lastUpdate.timestamp).toLocaleTimeString()
      });
    }
  }, [websocket.lastUpdate]);

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext debe ser usado dentro de WebSocketProvider');
  }
  return context;
}