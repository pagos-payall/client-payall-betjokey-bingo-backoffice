'use client';
import React from 'react';
import RoomStatusBadge from '@/components/RoomStatusBadge';
import RoomRestrictions from '@/components/RoomRestrictions';
import RoomActionButtons from '@/components/RoomActionButtons';
import { theme } from '@/data/themes';

// Mock room data for testing
const mockRooms = [
  {
    room_id: '001',
    room_name: 'Sala Disponible (Sin Juego)',
    status: 'off',
    game: null,
    users: { users_ids: [] }
  },
  {
    room_id: '002',
    room_name: 'Sala en Venta',
    status: 'active',
    game: {
      status: 'waiting',
      cards: { sold: 15, total: 100 }
    },
    users: { users_ids: ['user1', 'user2'] }
  },
  {
    room_id: '003',
    room_name: 'Sala con Juego Activo',
    status: 'active',
    game: {
      status: 'running',
      cards: { sold: 45, total: 100 }
    },
    users: { users_ids: ['user1', 'user2', 'user3'] }
  },
  {
    room_id: '004',
    room_name: 'Sala Archivada',
    status: 'archive',
    game: null,
    users: { users_ids: [] }
  }
];

export default function TestComponents() {
  const handleAction = (action, room) => {
    console.log(`Action: ${action}`, room);
    alert(`Action: ${action} on room: ${room.room_name}`);
  };

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: theme.dark.background.primary,
      minHeight: '100vh',
      color: theme.dark.colors.text 
    }}>
      <h1 style={{ marginBottom: '40px' }}>Test de Componentes Enhanced</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {mockRooms.map(room => (
          <div 
            key={room.room_id}
            style={{ 
              padding: '20px',
              backgroundColor: theme.dark.background.secundary,
              borderRadius: '10px',
              border: `1px solid ${theme.dark.borders.primary}`
            }}
          >
            <h3 style={{ marginBottom: '20px' }}>{room.room_name}</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4>Status Badge:</h4>
              <RoomStatusBadge room={room} />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4>Restrictions:</h4>
              <RoomRestrictions room={room} />
            </div>
            
            <div>
              <h4>Action Buttons:</h4>
              <RoomActionButtons 
                room={room} 
                onAction={handleAction}
                permissions={{
                  delete: true,
                  archive: true,
                  edit: true,
                  toggle: true
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}