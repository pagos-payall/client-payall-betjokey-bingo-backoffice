import { useEffect, useCallback } from 'react';
import websocketService from '@/services/websocketService';

// Hook para escuchar eventos WebSocket directamente
export function useDirectWebSocket(onRoomUpdate) {
  useEffect(() => {
    console.log('🎯 [useDirectWebSocket] Setting up direct listeners');

    // Handlers para eventos de salas
    const handleRoomStatusChanged = (data) => {
      console.log('🔄 [useDirectWebSocket] room:status:changed', data);
      if (onRoomUpdate) {
        onRoomUpdate('room:status:changed', data);
      }
    };

    const handleRoomActivated = (data) => {
      console.log('🟢 [useDirectWebSocket] room:activated', data);
      if (onRoomUpdate) {
        onRoomUpdate('room:activated', data);
      }
    };

    const handleRoomDeactivated = (data) => {
      console.log('🔴 [useDirectWebSocket] room:deactivated', data);
      if (onRoomUpdate) {
        onRoomUpdate('room:deactivated', data);
      }
    };

    const handleRoomArchived = (data) => {
      console.log('📦 [useDirectWebSocket] room:archived', data);
      if (onRoomUpdate) {
        onRoomUpdate('room:archived', data);
      }
    };

    const handleRoomsListUpdated = (data) => {
      console.log('📋 [useDirectWebSocket] rooms:list:updated', data);
      if (onRoomUpdate) {
        onRoomUpdate('rooms:list:updated', data);
      }
    };

    const handleGameStateUpdated = (data) => {
      console.log('🎮 [useDirectWebSocket] game:state:updated', data);
      if (onRoomUpdate) {
        onRoomUpdate('game:state:updated', data);
      }
    };

    // Registrar listeners
    websocketService.on('roomStatusChanged', handleRoomStatusChanged);
    websocketService.on('roomActivated', handleRoomActivated);
    websocketService.on('roomDeactivated', handleRoomDeactivated);
    websocketService.on('roomArchived', handleRoomArchived);
    websocketService.on('roomsListUpdated', handleRoomsListUpdated);
    websocketService.on('gameStateUpdated', handleGameStateUpdated);

    console.log('✅ [useDirectWebSocket] Direct listeners registered');

    // Cleanup
    return () => {
      console.log('🧹 [useDirectWebSocket] Cleaning up direct listeners');
      websocketService.off('roomStatusChanged', handleRoomStatusChanged);
      websocketService.off('roomActivated', handleRoomActivated);
      websocketService.off('roomDeactivated', handleRoomDeactivated);
      websocketService.off('roomArchived', handleRoomArchived);
      websocketService.off('roomsListUpdated', handleRoomsListUpdated);
      websocketService.off('gameStateUpdated', handleGameStateUpdated);
    };
  }, [onRoomUpdate]);
}

export default useDirectWebSocket;