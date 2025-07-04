import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../data/themes';
import { getActionRestriction } from '@/utils/errorHandler';
import { IconComponent } from './SubHeaderBar';
import {
  deleteIcon,
  editIcon,
  unarchiveIcon,
  toggle_on,
  toggle_off,
  closeIcon,
} from '@/data/icons';

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  background: ${props => {
    if (props.$variant === 'danger') return 'rgba(255, 0, 0, 0.1)';
    if (props.$variant === 'warning') return 'rgba(255, 165, 0, 0.1)';
    return 'transparent';
  }};
  
  &:hover {
    background: ${props => {
      if (props.$disabled) return 'transparent';
      if (props.$variant === 'danger') return 'rgba(255, 0, 0, 0.2)';
      if (props.$variant === 'warning') return 'rgba(255, 165, 0, 0.2)';
      return 'rgba(255, 255, 255, 0.1)';
    }};
  }

  p {
    font-size: 12px;
    color: ${props => {
      if (props.$variant === 'danger') return theme.dark.colors.red;
      if (props.$variant === 'warning') return theme.dark.colors.yellow;
      return theme.dark.colors.text;
    }};
    margin: 0;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid rgba(0, 0, 0, 0.9);
  }
`;

/**
 * Smart action buttons with preventive validation
 * Disables actions based on room state and shows tooltips
 */
const RoomActionButtons = ({ room, onAction, permissions = {} }) => {
  const [hoveredAction, setHoveredAction] = useState(null);
  
  // Check if room has scheduled deactivation - check both possible locations
  const hasScheduledDeactivation = room?.scheduled_deactivation?.enabled === true || 
                                   room?.scheduledDeactivation?.enabled === true;

  // Get restriction info for each action
  const canDelete = getActionRestriction(room, 'delete');
  const canEdit = getActionRestriction(room, 'edit');
  const canDeactivate = getActionRestriction(room, 'deactivate');
  const canActivate = getActionRestriction(room, 'activate');

  // Handle action click
  const handleAction = (action) => {
    const restrictions = {
      delete: canDelete,
      edit: canEdit,
      deactivate: canDeactivate,
      activate: canActivate,
    };
    
    if (restrictions[action]?.disabled) return;
    
    onAction(action, room);
  };

  const renderActionButton = (action, icon, label, restriction, variant) => {
    const isDisabled = restriction?.disabled || false;
    const tooltip = restriction?.reason || '';

    return (
      <ActionButtonWrapper
        onMouseEnter={() => isDisabled && setHoveredAction(action)}
        onMouseLeave={() => setHoveredAction(null)}
      >
        <ActionButton
          $disabled={isDisabled}
          $variant={variant}
          onClick={() => !isDisabled && handleAction(action)}
        >
          <IconComponent
            url={icon}
            size={20}
            color={variant === 'danger' ? 'red' : null}
          />
          <p>{label}</p>
        </ActionButton>
        <Tooltip $show={hoveredAction === action && isDisabled}>
          {tooltip}
        </Tooltip>
      </ActionButtonWrapper>
    );
  };

  return (
    <ButtonGroup>
      {/* Activate/Deactivate/Cancel Deactivation button - Always visible except for archived rooms */}
      
      {permissions.toggle !== false && room.status !== 'archive' && (
        room.status === 'disable' ? (
          renderActionButton(
            'activate',
            toggle_on,
            'Activar',
            canActivate,
            'normal'
          )
        ) : hasScheduledDeactivation ? (
          // Show cancel deactivation button when room has scheduled deactivation
          renderActionButton(
            'cancelDeactivation',
            closeIcon,
            'Cancelar Desactivación',
            { disabled: false }, // Always enabled for canceling
            'danger'
          )
        ) : (
          renderActionButton(
            'deactivate',
            toggle_off,
            'Desactivar',
            canDeactivate,
            'warning'
          )
        )
      )}

      {/* Delete button - Only for disabled rooms */}
      {permissions.delete !== false && (
        renderActionButton(
          'delete',
          deleteIcon,
          'Borrar',
          canDelete,
          'danger'
        )
      )}

      {/* Unarchive button - Only for archived rooms */}
      {permissions.archive !== false && room.status === 'archive' && (
        renderActionButton(
          'unarchive',
          unarchiveIcon,
          'Desarchivar',
          { disabled: false },
          'normal'
        )
      )}

      {/* Edit button */}
      {permissions.edit !== false && (
        renderActionButton(
          'edit',
          editIcon,
          'Editar',
          canEdit,
          'normal'
        )
      )}
    </ButtonGroup>
  );
};

export default RoomActionButtons;