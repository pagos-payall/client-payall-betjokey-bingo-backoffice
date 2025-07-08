'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const pathname = usePathname();
  const [shouldConnect, setShouldConnect] = useState(false);
  const [authCheckTrigger, setAuthCheckTrigger] = useState(0);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      // List of paths that don't require WebSocket
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      if (isPublicPath) {
        setShouldConnect(false);
        return;
      }
      
      // Since we can't read HttpOnly cookies from JavaScript,
      // we'll rely on the fact that the user reached the dashboard
      // which means they passed the middleware authentication
      const isOnProtectedRoute = pathname.startsWith('/dashboard') || 
                                 pathname.startsWith('/usersManagerView') ||
                                 pathname.startsWith('/reports');
      
      const canConnect = isOnProtectedRoute;
      
      
      setShouldConnect(canConnect);
    };
    
    // Delay initial check to ensure cookies are set
    if (authCheckTrigger === 0) {
      setTimeout(checkAuth, 100);
    } else {
      checkAuth();
    }
    
    // Re-check when pathname changes or auth state changes
  }, [pathname, authCheckTrigger]);
  
  // Listen for auth state changes
  useEffect(() => {
    // Listen for login success event
    const handleLoginSuccess = () => {
      setAuthCheckTrigger(prev => prev + 1);
    };
    
    // Listen for token refresh event
    const handleTokenRefresh = () => {
      setAuthCheckTrigger(prev => prev + 1);
    };
    
    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('token-refreshed', handleTokenRefresh);
    
    // Since we can't check cookies, we'll connect immediately when on protected routes
    // The WebSocket server should validate the cookies on its end
    if ((pathname.startsWith('/dashboard') || 
         pathname.startsWith('/usersManagerView') || 
         pathname.startsWith('/reports')) && !shouldConnect) {
      setAuthCheckTrigger(prev => prev + 1);
    }
    
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('token-refreshed', handleTokenRefresh);
    };
  }, [pathname, shouldConnect]);
  
  // Only initialize WebSocket if authenticated
  const websocket = useWebSocket(true, shouldConnect);

  useEffect(() => {
    if (shouldConnect) {
    }
  }, [websocket.connected, websocket.connecting, websocket.socketId, shouldConnect]);

  useEffect(() => {
    if (websocket.lastUpdate) {
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