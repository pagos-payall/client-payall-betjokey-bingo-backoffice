import styled from 'styled-components';
import { theme } from '../data/themes';

const RestrictionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => {
    switch(props.$severity) {
      case 'high': return 'rgba(255, 0, 0, 0.1)';
      case 'medium': return 'rgba(255, 165, 0, 0.1)';
      case 'low': return 'rgba(0, 100, 255, 0.1)';
      default: return 'rgba(128, 128, 128, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.$severity) {
      case 'high': return theme.dark.colors.red;
      case 'medium': return theme.dark.colors.yellow;
      case 'low': return theme.dark.colors.blue;
      default: return theme.dark.colors.gray;
    }
  }};
  border: 1px solid ${props => {
    switch(props.$severity) {
      case 'high': return theme.dark.colors.red;
      case 'medium': return theme.dark.colors.yellow;
      case 'low': return theme.dark.colors.blue;
      default: return theme.dark.colors.gray;
    }
  }};
`;

const IconWrapper = styled.span`
  font-size: 12px;
`;

// Icon mapping
const icons = {
  'game-controller': '🎮',
  'ticket': '🎫',
  'users': '👥',
  'lock': '🔒',
  'warning': '⚠️',
};

/**
 * Component to display room restrictions as chips
 * Shows why certain actions are disabled
 */
const RoomRestrictions = ({ room }) => {
  const restrictions = [];
  
  // Check for active game
  if (room.game?.status === 'running') {
    restrictions.push({
      icon: 'game-controller',
      text: 'Juego en progreso',
      severity: 'high'
    });
  }
  
  // Check for sold cards
  if (room.game?.cards?.sold > 0) {
    restrictions.push({
      icon: 'ticket',
      text: `${room.game.cards.sold} cartones vendidos`,
      severity: 'medium'
    });
  }
  
  // Check for connected users
  if (room.users?.users_ids?.length > 0) {
    restrictions.push({
      icon: 'users',
      text: `${room.users.users_ids.length} usuarios activos`,
      severity: 'low'
    });
  }
  
  // Check if room is archived
  if (room.status === 'archive') {
    restrictions.push({
      icon: 'lock',
      text: 'Sala archivada',
      severity: 'medium'
    });
  }
  
  // Check if room is in countdown
  if (room.game?.status === 'countdown') {
    restrictions.push({
      icon: 'warning',
      text: 'En cuenta regresiva',
      severity: 'high'
    });
  }
  
  if (restrictions.length === 0) return null;
  
  return (
    <RestrictionsContainer>
      {restrictions.map((restriction, index) => (
        <Chip key={index} $severity={restriction.severity}>
          <IconWrapper>
            {icons[restriction.icon] || '•'}
          </IconWrapper>
          {restriction.text}
        </Chip>
      ))}
    </RestrictionsContainer>
  );
};

export default RoomRestrictions;