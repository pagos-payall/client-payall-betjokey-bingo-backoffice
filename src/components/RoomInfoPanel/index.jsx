import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
	PanelContainer,
	StatusCard,
	StatusHeader,
	StatusBadge,
	GameStatus,
	DeactivationAlert,
	AlertIcon,
	MetricsGrid,
	MetricCard,
	MetricLabel,
	MetricValue,
	MetricSubtitle,
	MetricTrend,
	RequirementsSection,
	SectionTitle,
	ProgressBarContainer,
	ProgressInfo,
	ProgressLabel,
	ProgressValues,
	ProgressBar,
	ProgressFill,
	ConfigSection,
	ConfigGrid,
	ConfigItem,
	ConfigLabel,
	ConfigValue,
	StatsDashboard,
	StatsGrid,
	StatItem,
	StatValue,
	StatLabel,
} from './styles';
import { formatCurrency, formatNumber } from '@/services/utilFunctions';

// Helper function for game status text
function getGameStatusText(status) {
	const statusMap = {
		'created': 'Creado',
		'waiting': 'Esperando jugadores',
		'countdown': 'Iniciando...',
		'running': 'En progreso',
		'paused': 'Pausado',
		'settling': 'Procesando ganadores',
		'completed': 'Completado',
		'cancelled': 'Cancelado',
		// Room status mappings (not game status)
		'off': 'Desactivada',
		'archive': 'Archivada'
	};
	return statusMap[status] || 'Estado desconocido';
}
import { roomService } from '@/services/roomService';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import Button from '@/components/Button';
import { closeIcon } from '@/data/icons';
import { useRoomStatisticsCombined } from '@/hooks/useRoomStatisticsCombined';

const RoomInfoPanel = ({ room, initialValues, onRoomUpdate }) => {
	const { fetchAPICall } = useFetch();
	const { username } = useUser();

	const [cancellingDeactivation, setCancellingDeactivation] = useState(false);


	// Estado mapeado según el plan
	const getStatusMapping = (status) => {
		const statusMap = {
			off: { label: 'DISPONIBLE', color: 'secondary' },
			waiting: { label: 'EN_VENTA', color: 'warning' },
			active: { label: 'PARTIDA_ACTIVA', color: 'success' },
			delete: { label: 'FINALIZADA', color: 'dark' },
			archive: { label: 'ARCHIVADA', color: 'info' },
			disable: { label: 'DESACTIVADA', color: 'danger' },
		};
		return (
			statusMap[status] || { label: status.toUpperCase(), color: 'secondary' }
		);
	};

	const statusInfo = getStatusMapping(room.status);

	// Get combined statistics from both API and WebSocket
	const { 
		statistics, 
		loading: statsLoading, 
		error: statsError, 
		refresh: statsRefresh
	} = useRoomStatisticsCombined(room?.room_id, { ...initialValues, status: room?.status });


	// Use API data or fallback to room data
	const currentMetrics = statistics?.current_metrics || {
		// Fallback to room data if statistics API fails
		connected_users: room.users?.users_ids?.length || 0,
		sold_cards: room.game?.cards?.sold || 0,
		total_cards: room.game?.cards?.total || 0,
		revenue: (room.game?.cards?.sold || 0) * (initialValues?.card_price || 0),
		game_status: room.game?.status || null,
		game_status_text: null,
		occupancy_percentage: room.game?.cards?.total > 0 
			? ((room.game?.cards?.sold || 0) / room.game.cards.total) * 100 
			: 0
	};
	
	const dailyStats = statistics?.daily_stats || {};
	const requirementsStatus = statistics?.requirements_status || {
		// Fallback requirements - use correct fields from initialValues
		minimum_cards: initialValues?.minimum_cards || initialValues?.min_cards || 100,
		minimum_value: initialValues?.minimum_value || initialValues?.min_value || null,
		current_cards: currentMetrics.sold_cards || 0,
		current_value: currentMetrics.revenue || 0,
		can_start_game: false,
		percentage_complete: 0
	};


	const getProgressBarColor = (percentage) => {
		if (percentage >= 100) return 'success';
		if (percentage >= 50) return 'warning';
		return 'danger';
	};

	// Formatear fecha
	const formatDate = (dateString) => {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Formatear impuestos
	const formatTaxes = (taxes) => {
		if (!taxes || taxes.length === 0) return 'Sin impuestos';
		return taxes.map((tax) => `${tax.name}: ${tax.value}%`).join(', ');
	};

	// Cancelar desactivación programada
	const handleCancelDeactivation = async () => {
		setCancellingDeactivation(true);
		try {
			const apiConfig = await roomService.cancelScheduledDeactivation(
				room.room_id,
				username
			);
			await fetchAPICall(apiConfig.url, apiConfig.method, apiConfig.data);

			toast.success('Desactivación programada cancelada exitosamente');

			// Actualizar el estado de la sala
			if (onRoomUpdate) {
				onRoomUpdate();
			}
		} catch (error) {
			toast.error('Error al cancelar la desactivación programada');
		} finally {
			setCancellingDeactivation(false);
		}
	};

	return (
		<PanelContainer>
			{/* Card de Estado Principal */}
			<StatusCard $status={statusInfo.color}>
				<StatusHeader>
					<div>
						<StatusBadge $status={statusInfo.color}>
							<span className='status-icon'></span>
							{statusInfo.label}
						</StatusBadge>
					</div>
					{room.game && (
						<GameStatus>
							<span>
								🎮{' '}
								{room.game.status === 'in_progress'
									? 'Juego en progreso'
									: 'Juego esperando'}
							</span>
							<span style={{ color: '#999' }}>
								ID: {room.game_id || (room.game?.ref ? room.game.ref.slice(-4) : 'N/A')}
							</span>
						</GameStatus>
					)}
				</StatusHeader>
			</StatusCard>


			{/* Alerta de desactivación pendiente */}
			{room.scheduled_deactivation?.enabled && (
				<DeactivationAlert
					$immediate={room.scheduled_deactivation.immediate_deactivation}
				>
					<AlertIcon
						$immediate={room.scheduled_deactivation.immediate_deactivation}
					>
						{room.scheduled_deactivation.immediate_deactivation ? '🚨' : '⏰'}
					</AlertIcon>
					<div style={{ flex: 1 }}>
						<strong>
							{room.scheduled_deactivation.immediate_deactivation
								? 'Desactivación inmediata'
								: 'Desactivación programada'}
						</strong>
						<div style={{ fontSize: '12px', marginTop: '4px' }}>
							{room.scheduled_deactivation.immediate_deactivation
								? 'La sala se está desactivando en este momento'
								: 'La sala se desactivará automáticamente después del juego actual'}
							<br />
							Motivo: {room.scheduled_deactivation.reason ||
								'No especificado'}{' '}
							- Solicitado por{' '}
							{room.scheduled_deactivation.requested_by || 'Sistema'}
						</div>
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '50%',
							maxWidth: '200px',
						}}
					>
						<Button
							type='button'
							color='red'
							icoUrl={closeIcon}
							onClick={handleCancelDeactivation}
							disabled={cancellingDeactivation}
							style={{
								padding: '8px 16px',
								fontSize: '12px',
								margin: 'auto',
								marginLeft: '16px',
							}}
						>
							{cancellingDeactivation ? 'Cancelando...' : 'Cancelar'}
						</Button>
					</div>
				</DeactivationAlert>
			)}

			{/* Botón de actualización manual */}
			{statsError && (
				<div style={{ textAlign: 'center', marginBottom: '16px' }}>
					<Button 
						type="button" 
						color="blue" 
						onClick={statsRefresh}
						style={{ padding: '8px 16px', fontSize: '12px' }}
					>
						🔄 Actualizar estadísticas
					</Button>
				</div>
			)}

			{/* Grid de Métricas */}
			<MetricsGrid>
				<MetricCard>
					<MetricLabel>Usuarios Conectados</MetricLabel>
					<MetricValue>
						{statsLoading ? '...' : statsError ? 'Error' : formatNumber(currentMetrics.connected_users || 0)}
					</MetricValue>
					<MetricSubtitle>
						{statsError ? (
							<span style={{ color: '#ff4444', fontSize: '11px' }}>{statsError.message || 'Error al cargar'}</span>
						) : (
							`de ${formatNumber(500)} máximo`
						)}
					</MetricSubtitle>
					<MetricTrend $positive={currentMetrics.connected_users > 0}>
						{currentMetrics.connected_users > 0 ? '🟢 En línea' : '⚫ Sin usuarios'}
					</MetricTrend>
				</MetricCard>

				<MetricCard>
					<MetricLabel>Cartones Vendidos</MetricLabel>
					<MetricValue>
						{statsLoading ? '...' : formatNumber(currentMetrics.sold_cards || 0)}
					</MetricValue>
					<MetricSubtitle>
						de {formatNumber(currentMetrics.total_cards || 0)} totales ({formatNumber(currentMetrics.available_cards || 0)} disponibles)
					</MetricSubtitle>
					<MetricTrend>
						{currentMetrics.occupancy_formatted || `${Math.round(currentMetrics.occupancy_percentage || 0)}%`}
					</MetricTrend>
				</MetricCard>

				<MetricCard>
					<MetricLabel>Recaudación Actual</MetricLabel>
					<MetricValue>
						{statsLoading ? '...' : (currentMetrics.revenue_formatted || formatCurrency(currentMetrics.revenue || 0))}
					</MetricValue>
					<MetricSubtitle>
						Precio: {formatCurrency(initialValues?.card_price || 0)} por cartón
					</MetricSubtitle>
					<MetricTrend $positive={currentMetrics.revenue > 0}>
						{currentMetrics.revenue > 0 ? '↑ Activo' : '- Sin ventas'}
					</MetricTrend>
				</MetricCard>

				<MetricCard>
					<MetricLabel>Estado del Juego</MetricLabel>
					<MetricValue style={{ fontSize: '20px' }}>
						{statsLoading ? '...' : 
							(room.status === 'archive' || room.status === 'archived') ? 'No asignado' :
							(currentMetrics.game_status_text || getGameStatusText(currentMetrics.game_status) || 'Sin juego')
						}
					</MetricValue>
					{currentMetrics.game_duration_formatted && room.status !== 'archive' && room.status !== 'archived' && (
						<MetricSubtitle>Tiempo: {currentMetrics.game_duration_formatted}</MetricSubtitle>
					)}
					<MetricTrend>
						{room.status === 'archive' || room.status === 'archived' 
							? 'Sin juego asignado'
							: (room.game
								? `Juego #${room.game_id || (room.game?.ref ? room.game.ref.slice(-4) : '1')}`
								: 'Esperando inicio')}
					</MetricTrend>
				</MetricCard>
			</MetricsGrid>

			{/* Sección de Requisitos Mínimos */}
			<RequirementsSection>
				<SectionTitle>📊 Requisitos Mínimos para Iniciar Partida</SectionTitle>

				<ProgressBarContainer>
					<ProgressInfo>
						<ProgressLabel>
							{requirementsStatus.minimum_value ? 'Valor mínimo' : 'Cartones mínimos'}
						</ProgressLabel>
						<ProgressValues>
							{requirementsStatus.minimum_value ? (
								<>
									{formatCurrency(requirementsStatus.current_value || 0)} / {formatCurrency(requirementsStatus.minimum_value)}
									<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
										({requirementsStatus.current_cards || 0} / {requirementsStatus.minimum_cards || 0} cartones)
									</div>
								</>
							) : (
								`${requirementsStatus.current_cards || 0} / ${requirementsStatus.minimum_cards || 0}`
							)}
						</ProgressValues>
					</ProgressInfo>
					<ProgressBar>
						<ProgressFill
							$status={getProgressBarColor(requirementsStatus.percentage_complete || 0)}
							style={{
								width: `${Math.min(requirementsStatus.percentage_complete || 0, 100)}%`,
							}}
						/>
					</ProgressBar>
				</ProgressBarContainer>

				{requirementsStatus.can_start_game !== undefined && (
					<div style={{ 
						marginTop: '16px', 
						textAlign: 'center', 
						fontSize: '14px',
						color: requirementsStatus.can_start_game ? '#28a745' : '#dc3545',
						fontWeight: '600'
					}}>
						{requirementsStatus.can_start_game ? '✅ Puede iniciar partida' : '❌ No puede iniciar partida'}
					</div>
				)}
			</RequirementsSection>

			{/* Configuración de la Sala */}
			<ConfigSection>
				<SectionTitle>⚙️ Configuración de la Sala</SectionTitle>
				<ConfigGrid>
					<ConfigItem>
						<ConfigLabel>Tipo de Juego</ConfigLabel>
						<ConfigValue>{initialValues?.typeOfGame || '-'}</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Tipo de Jugada</ConfigLabel>
						<ConfigValue>{initialValues?.play || '-'}</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Administrador</ConfigLabel>
						<ConfigValue>{initialValues?.host_username || '-'}</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Creada</ConfigLabel>
						<ConfigValue>{formatDate(statistics?.createdAt || room.createAt)}</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Comisión</ConfigLabel>
						<ConfigValue>{initialValues?.comision || 0}%</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Premios</ConfigLabel>
						<ConfigValue>{initialValues?.premios || 0}%</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Premios Especiales</ConfigLabel>
						<ConfigValue>{initialValues?.pote_especial || 0}%</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Impuestos</ConfigLabel>
						<ConfigValue>{formatTaxes(initialValues?.taxes)}</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Distribución Cartón</ConfigLabel>
						<ConfigValue>
							{initialValues?.porcen_premio_asignado_carton || 0}%
						</ConfigValue>
					</ConfigItem>
					<ConfigItem>
						<ConfigLabel>Distribución Línea</ConfigLabel>
						<ConfigValue>
							{initialValues?.porcen_premio_asignado_linea || 0}%
						</ConfigValue>
					</ConfigItem>
				</ConfigGrid>
			</ConfigSection>

			{/* Mini Dashboard de Estadísticas */}
			<StatsDashboard>
				<SectionTitle>📈 Estadísticas del Día</SectionTitle>
				<StatsGrid>
					<StatItem>
						<StatValue>
							{statsLoading ? '...' : (dailyStats.completed_games || 0)}
						</StatValue>
						<StatLabel>Partidas Completadas</StatLabel>
					</StatItem>
					<StatItem>
						<StatValue>
							{statsLoading ? '...' : formatCurrency(dailyStats.total_revenue || 0)}
						</StatValue>
						<StatLabel>Recaudación Total</StatLabel>
					</StatItem>
					<StatItem>
						<StatValue>
							{statsLoading ? '...' : (dailyStats.average_players_per_game || 0)}
						</StatValue>
						<StatLabel>Promedio Jugadores</StatLabel>
					</StatItem>
				</StatsGrid>
			</StatsDashboard>
		</PanelContainer>
	);
};

export default RoomInfoPanel;
