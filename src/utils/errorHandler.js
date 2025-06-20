// Error codes mapping from API
export const ERROR_CODES = {
  ROOM_HAS_ACTIVE_GAME: 'ROOM_HAS_ACTIVE_GAME',
  ROOM_HAS_SOLD_CARDS: 'ROOM_HAS_SOLD_CARDS',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  ROOM_ALREADY_ARCHIVED: 'ROOM_ALREADY_ARCHIVED',
  CANNOT_DELETE_ACTIVE_ROOM: 'CANNOT_DELETE_ACTIVE_ROOM',
};

// Human-readable messages for each error code
const ERROR_MESSAGES = {
  [ERROR_CODES.ROOM_HAS_ACTIVE_GAME]: {
    title: 'No se puede realizar esta acción',
    message: 'La sala tiene un juego activo. Finaliza el juego antes de continuar.',
    actions: ['Finalizar juego primero'],
  },
  [ERROR_CODES.ROOM_HAS_SOLD_CARDS]: {
    title: 'Operación no permitida',
    message: 'La sala tiene cartones vendidos. Espera a que termine el juego.',
    actions: ['Esperar fin del juego'],
  },
  [ERROR_CODES.ROOM_NOT_FOUND]: {
    title: 'Sala no encontrada',
    message: 'La sala que intentas modificar no existe.',
    actions: ['Actualizar lista de salas'],
  },
  [ERROR_CODES.INVALID_STATE_TRANSITION]: {
    title: 'Transición de estado inválida',
    message: 'No se puede cambiar al estado solicitado desde el estado actual.',
    actions: ['Verificar estado actual'],
  },
  [ERROR_CODES.ROOM_ALREADY_ARCHIVED]: {
    title: 'Sala ya archivada',
    message: 'Esta sala ya se encuentra archivada.',
    actions: ['Refrescar vista'],
  },
  [ERROR_CODES.CANNOT_DELETE_ACTIVE_ROOM]: {
    title: 'No se puede eliminar',
    message: 'No se puede eliminar una sala activa. Archívala primero.',
    actions: ['Archivar sala primero'],
  },
};

/**
 * Processes API error response and returns structured error info
 * @param {Object} error - Error object from API
 * @returns {Object} Structured error information
 */
export function processApiError(error) {
  const errorData = error?.response?.data;
  
  // Check if we have a specific error code
  const errorCode = errorData?.data?.code;
  
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    const errorInfo = ERROR_MESSAGES[errorCode];
    const restrictions = errorData?.data?.restrictions || {};
    
    // Enhance message with specific details if available
    let enhancedMessage = errorInfo.message;
    
    if (errorCode === ERROR_CODES.ROOM_HAS_ACTIVE_GAME && restrictions.gameStatus) {
      enhancedMessage = `La sala tiene un juego ${restrictions.gameStatus}. `;
      if (restrictions.gameSoldCards) {
        enhancedMessage += `Hay ${restrictions.gameSoldCards} cartones vendidos. `;
      }
      enhancedMessage += 'Finaliza el juego antes de continuar.';
    }
    
    if (errorCode === ERROR_CODES.ROOM_HAS_SOLD_CARDS && restrictions.soldCards) {
      enhancedMessage = `Hay ${restrictions.soldCards} cartones vendidos. Espera a que termine el juego.`;
    }
    
    return {
      code: errorCode,
      title: errorInfo.title,
      message: enhancedMessage,
      actions: errorInfo.actions,
      restrictions,
      severity: 'error',
    };
  }
  
  // Fallback to generic error message
  const genericMessage = errorData?.error || error?.message || 'Error desconocido';
  
  return {
    code: 'UNKNOWN_ERROR',
    title: 'Error',
    message: genericMessage,
    actions: [],
    restrictions: {},
    severity: 'error',
  };
}

/**
 * Formats error for toast notification
 * @param {Object} errorInfo - Processed error information
 * @returns {string} Formatted error message for toast
 */
export function formatErrorForToast(errorInfo) {
  return `${errorInfo.title}: ${errorInfo.message}`;
}

/**
 * Determines if an action should be disabled based on room state
 * @param {Object} room - Room object
 * @param {string} action - Action to check ('archive', 'delete', 'edit', 'deactivate')
 * @returns {Object} { disabled: boolean, reason: string }
 */
export function getActionRestriction(room, action) {
  switch (action) {
    case 'archive':
      if (room.status === 'archive') {
        return { disabled: true, reason: 'La sala ya está archivada' };
      }
      if (room.status !== 'disable') {
        return { disabled: true, reason: 'La sala debe estar desactivada primero' };
      }
      if (room.game?.status && ['running', 'countdown', 'waiting'].includes(room.game.status)) {
        return { disabled: true, reason: 'No se puede archivar: juego en progreso' };
      }
      if (room.game?.cards?.sold > 0) {
        return { disabled: true, reason: `No se puede archivar: ${room.game.cards.sold} cartones vendidos` };
      }
      return { disabled: false, reason: '' };
      
    case 'delete':
      // Se pueden eliminar salas desactivadas o apagadas
      if (room.status === 'archive') {
        return { disabled: true, reason: 'No se pueden eliminar salas archivadas' };
      }
      // Permitir eliminar si está desactivada, off, o disponible (active sin juego)
      if (room.status === 'disable' || room.status === 'off' || (room.status === 'active' && !room.game)) {
        return { disabled: false, reason: '' };
      }
      // No permitir si tiene juego activo
      if (room.game?.status && ['running', 'countdown', 'waiting'].includes(room.game.status)) {
        return { disabled: true, reason: 'No se puede eliminar: juego en progreso' };
      }
      if (room.game?.cards?.sold > 0) {
        return { disabled: true, reason: `No se puede eliminar: ${room.game.cards.sold} cartones vendidos` };
      }
      return { disabled: true, reason: 'La sala debe estar desactivada para poder eliminarla' };
      
    case 'deactivate':
      if (room.status === 'disable') {
        return { disabled: true, reason: 'La sala ya está desactivada' };
      }
      if (room.status === 'archive') {
        return { disabled: true, reason: 'No se puede desactivar una sala archivada' };
      }
      // Una sala en estado 'waiting' puede ser desactivada
      if (room.status === 'waiting') {
        return { disabled: false, reason: '' };
      }
      if (room.game?.status && ['running', 'countdown', 'waiting'].includes(room.game.status)) {
        return { disabled: true, reason: 'No se puede desactivar: juego en progreso' };
      }
      if (room.game?.cards?.sold > 0) {
        return { disabled: true, reason: `No se puede desactivar: ${room.game.cards.sold} cartones vendidos` };
      }
      return { disabled: false, reason: '' };
      
    case 'activate':
      if (room.status !== 'disable') {
        return { disabled: true, reason: 'Solo se pueden activar salas desactivadas' };
      }
      return { disabled: false, reason: '' };
      
    case 'edit':
      // Solo permitir edición en salas DISPONIBLES (active sin juego) o ARCHIVADAS
      if (room.status === 'archive') {
        return { disabled: false, reason: '' };
      }
      
      // Si es active sin juego (DISPONIBLE), permitir
      if (room.status === 'active' && !room.game) {
        return { disabled: false, reason: '' };
      }
      
      // Si tiene juego activo, no permitir
      if (room.game?.status && ['waiting', 'countdown', 'running', 'completed'].includes(room.game.status)) {
        return { disabled: true, reason: 'No se puede editar: la sala tiene un juego' };
      }
      
      // Si hay cartones vendidos, no permitir
      if (room.game?.cards?.sold > 0) {
        return { disabled: true, reason: `No se puede editar: ${room.game.cards.sold} cartones vendidos` };
      }
      
      // Por defecto, no permitir
      return { disabled: true, reason: 'Solo se puede editar salas disponibles o archivadas' };
      
    default:
      return { disabled: false, reason: '' };
  }
}