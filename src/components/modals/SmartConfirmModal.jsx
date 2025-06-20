import { useState } from 'react';
import styled from 'styled-components';
import { ModalContainer, ModalBox } from './ModalStyles';
import Button from '../Button';
import { theme } from '../../data/themes';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.h5`
  font-size: 15px;
  margin: 0;
  text-align: center;
  color: ${theme.dark.colors.gray};
`;

const WarningsContainer = styled.div`
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid ${theme.dark.colors.yellow};
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

const WarningTitle = styled.p`
  color: ${theme.dark.colors.yellow};
  font-weight: bold;
  margin: 0 0 8px 0;
`;

const WarningList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: ${theme.dark.colors.text};
`;

const WarningItem = styled.li`
  margin: 4px 0;
`;

const ReasonInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid ${theme.dark.colors.gray};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: ${theme.dark.colors.text};
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.dark.colors.blue};
  }
  
  &::placeholder {
    color: ${theme.dark.colors.gray};
  }
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: ${theme.dark.colors.gray};
  text-align: center;
  margin: 0;
`;

/**
 * Smart confirmation modal with contextual warnings
 * Shows relevant information before destructive actions
 */
const SmartConfirmModal = ({ 
  modalContent, 
  closeModal, 
  onConfirm,
  showReasonInput = false,
  reasonRequired = false,
  room = null 
}) => {
  const [reason, setReason] = useState('');
  
  // Generate warnings based on room state
  const generateWarnings = () => {
    if (!room) return [];
    
    const warnings = [];
    
    if (room.users?.users_ids?.length > 0) {
      warnings.push(`${room.users.users_ids.length} usuarios conectados serán desconectados`);
    }
    
    if (room.game?.cards?.sold > 0) {
      warnings.push(`${room.game.cards.sold} cartones vendidos serán afectados`);
    }
    
    if (room.game?.status === 'running') {
      warnings.push('El juego activo será finalizado');
    }
    
    if (room.game?.status === 'countdown') {
      warnings.push('La cuenta regresiva será cancelada');
    }
    
    return warnings;
  };
  
  const warnings = generateWarnings();
  const hasWarnings = warnings.length > 0;
  
  const handleConfirm = () => {
    if (reasonRequired && !reason.trim()) {
      alert('Por favor proporciona una razón para esta acción');
      return;
    }
    
    onConfirm({
      confirmed: true,
      reason: reason.trim(),
      ...modalContent
    });
    
    closeModal();
  };
  
  return (
    <ModalContainer>
      <ModalBox $maxHeight={'500px'}>
        <ModalContent>
          <Title>{modalContent.title}</Title>
          
          {modalContent.subtitle && (
            <Subtitle>{modalContent.subtitle}</Subtitle>
          )}
          
          {hasWarnings && (
            <WarningsContainer>
              <WarningTitle>⚠️ Esta acción afectará a:</WarningTitle>
              <WarningList>
                {warnings.map((warning, index) => (
                  <WarningItem key={index}>{warning}</WarningItem>
                ))}
              </WarningList>
            </WarningsContainer>
          )}
          
          {showReasonInput && (
            <div>
              <Label>
                Razón de la operación {reasonRequired && '*'}
              </Label>
              <ReasonInput
                placeholder="Describe brevemente la razón de esta acción..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
              />
              <InfoText>
                {reason.length}/200 caracteres
              </InfoText>
            </div>
          )}
          
          <ButtonContainer>
            <Button 
              color={'red'} 
              $w={50} 
              onClick={closeModal}
            >
              {modalContent.cancelText || 'Cancelar'}
            </Button>
            <Button
              color={modalContent.type === 'delete' ? 'red' : 'green'}
              $w={50}
              onClick={handleConfirm}
            >
              {modalContent.confirmText || 'Aceptar'}
            </Button>
          </ButtonContainer>
        </ModalContent>
      </ModalBox>
    </ModalContainer>
  );
};

export default SmartConfirmModal;