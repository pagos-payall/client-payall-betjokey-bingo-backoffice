import Separator from './Separator';
import { theme } from '../data/themes';
import styled from 'styled-components';
import RoomStatusBadge from './RoomStatusBadge';
import RoomRestrictions from './RoomRestrictions';
import Link from 'next/link';

const SalaStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  background: ${theme.dark.background.secundary};
  padding: 16px;
  transition: 0.35s ease-in-out;
  cursor: pointer;
  position: relative;
  
  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h5`
  color: ${theme.dark.fonts.title_headers};
  margin: 0;
  font-size: 18px;
`;

const RoomId = styled.span`
  color: ${theme.dark.fonts.subHeaders_text};
  font-size: 14px;
  opacity: 0.8;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const InfoLabel = styled.span`
  color: ${theme.dark.fonts.subHeaders_text};
  font-size: 14px;
  opacity: 0.8;
`;

const InfoValue = styled.span`
  color: ${theme.dark.fonts.subHeaders_text};
  font-size: 14px;
  font-weight: 500;
`;

const GameStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${theme.dark.borders.secundary};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${theme.dark.fonts.subHeaders_text};
`;

const StatIcon = styled.span`
  font-size: 16px;
`;

/**
 * Enhanced room card component with better status display
 * Shows room status, game info, and restrictions
 */
const ScheduledBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 20px;
  background-color: ${props => props.$immediate 
    ? 'rgba(255, 0, 0, 0.2)'  // Red with transparency for immediate
    : 'rgba(135, 206, 235, 0.2)'}; // Sky blue with transparency for scheduled
  border: 1px solid ${props => props.$immediate ? '#ff4444' : '#87CEEB'};
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.$immediate ? '#ff4444' : '#87CEEB'};
`;

const SalaMenuCardEnhanced = ({ data, isScheduledForDeactivation = false }) => {
  // Check if deactivation is immediate
  const isImmediateDeactivation = data?.scheduled_deactivation?.immediate_deactivation === true;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate occupancy percentage
  const getOccupancy = () => {
    if (!data.game?.cards) return 0;
    const { sold, total } = data.game.cards;
    return total > 0 ? Math.round((sold / total) * 100) : 0;
  };

  const occupancy = getOccupancy();

  return (
    <Link
      href={{
        pathname: '/dashboard/roomForm',
        query: JSON.stringify(data),
      }}
      style={{ textDecoration: 'none' }}
    >
      <SalaStyle>
        <CardHeader>
          <TitleSection>
            <Title>{data.room_name}</Title>
            <RoomId>ID: {data.room_id}</RoomId>
          </TitleSection>
          <BadgesContainer>
            <RoomStatusBadge room={data} />
            {isScheduledForDeactivation && (
              <ScheduledBadge $immediate={isImmediateDeactivation}>
                {isImmediateDeactivation 
                  ? 'Desactivación - inmediata' 
                  : 'Desactivación - programada'}
              </ScheduledBadge>
            )}
          </BadgesContainer>
        </CardHeader>

        <InfoSection>
          <InfoRow>
            <InfoLabel>Tipo de juego:</InfoLabel>
            <InfoValue>{data.game?.typeOfGame || 'No definido'}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Administrador:</InfoLabel>
            <InfoValue>{data.host_username}</InfoValue>
          </InfoRow>

          {data.game?.ref && (
            <InfoRow>
              <InfoLabel>Última actualización:</InfoLabel>
              <InfoValue>{formatDate(data.updatedAt || data.createdAt)}</InfoValue>
            </InfoRow>
          )}
        </InfoSection>

        {/* Game statistics if available */}
        {data.game && (data.game.cards?.sold > 0 || data.users?.users_ids?.length > 0) && (
          <GameStats>
            {data.game.cards?.sold > 0 && (
              <StatItem>
                <StatIcon>🎫</StatIcon>
                <span>{data.game.cards.sold} cartones</span>
              </StatItem>
            )}
            
            {data.users?.users_ids?.length > 0 && (
              <StatItem>
                <StatIcon>👥</StatIcon>
                <span>{data.users.users_ids.length} usuarios</span>
              </StatItem>
            )}
            
            {occupancy > 0 && (
              <StatItem>
                <StatIcon>📊</StatIcon>
                <span>{occupancy}% ocupación</span>
              </StatItem>
            )}
          </GameStats>
        )}

        {/* Show restrictions if any */}
        <RoomRestrictions room={data} />
      </SalaStyle>
    </Link>
  );
};

export default SalaMenuCardEnhanced;