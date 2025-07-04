'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWebSocketContext } from '@/components/WebSocketProvider';
import { theme } from '@/data/themes';

const MonitorContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 500px;
  background: ${theme.dark.background.primary};
  border: 1px solid ${theme.dark.borders.table};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 12px 16px;
  background: ${theme.dark.background.secundary};
  border-bottom: 1px solid ${theme.dark.borders.table};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
`;

const Title = styled.h4`
  margin: 0;
  font-size: 14px;
  color: ${theme.dark.fonts.title_headers};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.dark.fonts.light_text};
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const EventsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 400px;
`;

const EventItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  background: ${theme.dark.background.secundary};
  border-radius: 6px;
  border-left: 3px solid ${props => {
    switch(props.$type) {
      case 'room:activated': return theme.dark.colors.green;
      case 'room:deactivated': return theme.dark.colors.red;
      case 'room:status:changed': return theme.dark.colors.yellow;
      case 'connected': return theme.dark.colors.green;
      case 'disconnected': return theme.dark.colors.red;
      default: return theme.dark.colors.blue;
    }
  }};
`;

const EventType = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.dark.fonts.title_headers};
  margin-bottom: 4px;
`;

const EventData = styled.pre`
  font-size: 11px;
  color: ${theme.dark.fonts.light_text};
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const EventTime = styled.div`
  font-size: 10px;
  color: ${theme.dark.fonts.placeholder};
  margin-top: 4px;
`;

const StatusBar = styled.div`
  padding: 8px 16px;
  background: ${props => props.$connected ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  border-top: 1px solid ${theme.dark.borders.table};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${props => props.$connected ? theme.dark.colors.green : theme.dark.colors.red};
`;

const ClearButton = styled.button`
  background: ${theme.dark.background.primary};
  border: 1px solid ${theme.dark.borders.table};
  color: ${theme.dark.fonts.light_text};
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: ${theme.dark.background.hover};
  }
`;

const WebSocketMonitor = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const { connected, lastUpdate, socketId } = useWebSocketContext();

  useEffect(() => {
    if (lastUpdate) {
      const newEvent = {
        id: Date.now(),
        type: lastUpdate.type,
        data: lastUpdate.data,
        timestamp: new Date(lastUpdate.timestamp).toLocaleTimeString()
      };
      
      setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Mantener solo los últimos 50 eventos
    }
  }, [lastUpdate]);

  if (!isOpen) return null;

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <MonitorContainer>
      <Header>
        <Title>🔍 WebSocket Monitor</Title>
        <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
      </Header>
      
      <EventsList>
        {events.length === 0 ? (
          <EventItem>
            <EventType>Sin eventos</EventType>
            <EventData>Esperando eventos del WebSocket...</EventData>
          </EventItem>
        ) : (
          events.map(event => (
            <EventItem key={event.id} $type={event.type}>
              <EventType>{event.type}</EventType>
              <EventData>{JSON.stringify(event.data, null, 2)}</EventData>
              <EventTime>{event.timestamp}</EventTime>
            </EventItem>
          ))
        )}
      </EventsList>
      
      <StatusBar $connected={connected}>
        <span>{connected ? '🟢 Conectado' : '🔴 Desconectado'} | ID: {socketId || 'N/A'}</span>
        <ClearButton onClick={clearEvents}>Limpiar</ClearButton>
      </StatusBar>
    </MonitorContainer>
  );
};

export default WebSocketMonitor;