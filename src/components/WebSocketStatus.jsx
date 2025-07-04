'use client';

import React from 'react';
import styled from 'styled-components';
import { useWebSocketContext } from '@/components/WebSocketProvider';
import { theme } from '@/data/themes';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.$connected 
    ? 'rgba(40, 167, 69, 0.1)' 
    : props.$connecting 
      ? 'rgba(255, 193, 7, 0.1)' 
      : 'rgba(220, 53, 69, 0.1)'};
  border: 1px solid ${props => props.$connected 
    ? theme.dark.colors.green 
    : props.$connecting 
      ? theme.dark.colors.yellow 
      : theme.dark.colors.red};
  border-radius: 20px;
  font-size: 13px;
  color: ${props => props.$connected 
    ? theme.dark.colors.green 
    : props.$connecting 
      ? theme.dark.colors.yellow 
      : theme.dark.colors.red};
  transition: all 0.3s ease;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$connected 
    ? theme.dark.colors.green 
    : props.$connecting 
      ? theme.dark.colors.yellow 
      : theme.dark.colors.red};
  animation: ${props => props.$connecting ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }
`;

const StatusText = styled.span`
  font-weight: 500;
`;

const WebSocketStatus = ({ showText = true }) => {
  const { connected, connecting } = useWebSocketContext();

  const getStatusText = () => {
    if (connected) return 'Conectado';
    if (connecting) return 'Conectando...';
    return 'Desconectado';
  };

  return (
    <StatusContainer 
      $connected={connected} 
      $connecting={connecting}
      title={`Estado: ${getStatusText()}`}
    >
      <StatusDot 
        $connected={connected} 
        $connecting={connecting} 
      />
      {showText && (
        <StatusText>
          {getStatusText()}
        </StatusText>
      )}
    </StatusContainer>
  );
};

export default WebSocketStatus;