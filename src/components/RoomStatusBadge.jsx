import styled from 'styled-components';
import { theme } from '../data/themes';
import StatusLight from './StatusLight';

// Map room and game status to display status
const getActualStatus = (room) => {
	if (room.status === 'archive') return 'ARCHIVADA';
	if (room.status === 'disable') return 'DESACTIVADA';
	if (room.status === 'waiting') return 'ESPERANDO';
	// Tratar 'off' como 'DISPONIBLE' para retrocompatibilidad
	if (room.status === 'off') return 'DISPONIBLE';

	// Si no hay juego, usar el estado de la sala
	if (!room.game) {
		return room.status === 'active' ? 'DISPONIBLE' : room.status.toUpperCase();
	}

	// Si hay juego, usar el estado del juego
	switch (room.game.status) {
		case 'waiting':
		case 'countdown':
			return 'EN_VENTA';
		case 'running':
			return 'PARTIDA_ACTIVA';
		case 'completed':
			return 'FINALIZADA';
		default:
			return room.status.toUpperCase();
	}
};

// Status configuration with colors and icons
const statusConfig = {
	DISPONIBLE: {
		color: theme.dark.colors.gray,
		bgColor: 'rgba(128, 128, 128, 0.1)', // purple with transparency
		icon: '',
	},
	EN_VENTA: {
		color: theme.dark.colors.yellow,
		bgColor: 'rgba(242, 175, 92, 0.1)', // yellow with transparency
		icon: '🎫',
	},
	PARTIDA_ACTIVA: {
		color: theme.dark.colors.blue,
		bgColor: 'rgba(0, 123, 255, 0.1)', // blue with transparency
		icon: '🎮',
	},
	FINALIZADA: {
		color: theme.dark.colors.gray,
		bgColor: 'rgba(128, 128, 128, 0.1)', // gray with transparency
		icon: '🏁',
	},
	ARCHIVADA: {
		color: theme.dark.colors.purple,
		bgColor: 'rgba(136, 77, 255, 0.1)', // purple with transparency
		icon: '📁',
	},
	DESACTIVADA: {
		color: theme.dark.colors.red,
		bgColor: 'rgba(242, 92, 120, 0.1)', // red with transparency
		icon: '🚫',
	},
	ESPERANDO: {
		color: theme.dark.colors.yellow,
		bgColor: 'rgba(242, 175, 92, 0.1)', // yellow with transparency
		icon: '⏳',
	},
};

const BadgeContainer = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 4px 12px;
	border-radius: 20px;
	background-color: ${(props) => props.$bgColor || 'rgba(255, 255, 255, 0.1)'};
	border: 1px solid ${(props) => props.$color || theme.dark.colors.gray};
	font-size: 12px;
	font-weight: 500;
`;

const StatusText = styled.span`
	color: ${(props) => props.color || theme.dark.colors.text};
`;

const CardsInfo = styled.span`
	color: ${(props) => props.color || theme.dark.colors.text};
	opacity: 0.8;
	margin-left: 4px;
`;

const IconWrapper = styled.span`
	font-size: 14px;
	margin-right: 2px;
`;

/**
 * Enhanced room status badge component
 * Shows room status with visual indicators and card count
 */
const RoomStatusBadge = ({ room, showIcon = true, showCards = true }) => {
	const status = getActualStatus(room);
	const config = statusConfig[status] || statusConfig['DISPONIBLE'];
	const hasCards = room.game?.cards?.sold > 0;

	return (
		<BadgeContainer $color={config.color} $bgColor={config.bgColor}>
			<StatusLight $color={config.color} size={8} />
			{showIcon && config.icon && <IconWrapper>{config.icon}</IconWrapper>}
			<StatusText color={config.color}>{status}</StatusText>
			{showCards && hasCards && (
				<CardsInfo color={config.color}>
					({room.game.cards.sold} cartones)
				</CardsInfo>
			)}
		</BadgeContainer>
	);
};

export default RoomStatusBadge;
