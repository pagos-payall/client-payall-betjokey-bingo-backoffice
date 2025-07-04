import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import RoomStatsPanel from '@/components/RoomStatsPanel';
import { roomService } from '@/services/roomService';
import useFetch from '@/hooks/useFetch';

const StatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: ${theme.dark.background.secondary};
  border-radius: 8px;
  color: ${theme.dark.text.primary};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${theme.dark.text.primary};
  font-size: 24px;
`;

const RoomSelector = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.dark.borders.primary};
  border-radius: 4px;
  background-color: ${theme.dark.background.primary};
  color: ${theme.dark.text.primary};
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${theme.dark.text.accent};
  }
`;

const RefreshButton = styled.button`
  padding: 8px 16px;
  background-color: ${theme.dark.background.accent};
  color: ${theme.dark.text.primary};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${theme.dark.background.hover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: ${theme.dark.text.secondary};
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${theme.dark.text.secondary};
  text-align: center;
`;

const RoomStatistics = () => {
  const { fetchAPICall } = useFetch();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiConfig = roomService.getRooms();
        const response = await fetchAPICall(
          apiConfig.url,
          apiConfig.method,
          apiConfig.data,
          false // No notification
        );

        if (response && response.data) {
          const roomsList = response.data;
          setRooms(roomsList);
          
          // Auto-select first room if available
          if (roomsList.length > 0) {
            setSelectedRoomId(roomsList[0].room_id);
          }
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Error al cargar las salas');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [fetchAPICall]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRoomChange = (e) => {
    setSelectedRoomId(e.target.value);
  };

  if (loading) {
    return (
      <StatisticsContainer>
        <LoadingMessage>
          <div>⏳ Cargando salas disponibles...</div>
        </LoadingMessage>
      </StatisticsContainer>
    );
  }

  if (error) {
    return (
      <StatisticsContainer>
        <ErrorMessage>
          {error}
        </ErrorMessage>
      </StatisticsContainer>
    );
  }

  if (rooms.length === 0) {
    return (
      <StatisticsContainer>
        <EmptyState>
          <h3>No hay salas disponibles</h3>
          <p>No se encontraron salas para mostrar estadísticas.</p>
        </EmptyState>
      </StatisticsContainer>
    );
  }

  return (
    <StatisticsContainer>
      <Header>
        <Title>📊 Estadísticas de Salas</Title>
        <RoomSelector>
          <label style={{ color: theme.dark.text.secondary }}>Sala:</label>
          <Select value={selectedRoomId} onChange={handleRoomChange}>
            <option value="">Seleccionar sala...</option>
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                Sala {room.room_id} - {room.status}
              </option>
            ))}
          </Select>
          <RefreshButton onClick={handleRefresh}>
            🔄 Actualizar
          </RefreshButton>
        </RoomSelector>
      </Header>

      {selectedRoomId ? (
        <RoomStatsPanel
          key={`${selectedRoomId}-${refreshKey}`}
          roomId={selectedRoomId}
          options={{
            autoRefresh: true,
            refreshInterval: 30000,
            includeHistory: false
          }}
        />
      ) : (
        <EmptyState>
          <h3>Selecciona una sala</h3>
          <p>Elige una sala del selector para ver sus estadísticas detalladas.</p>
        </EmptyState>
      )}
    </StatisticsContainer>
  );
};

export default RoomStatistics;