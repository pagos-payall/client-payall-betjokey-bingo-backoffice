import React, { useState } from 'react';
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
import { roomService } from '@/services/roomService';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import Button from '@/components/Button';
import { closeIcon } from '@/data/icons';
import RoomStatsPanel from '@/components/RoomStatsPanel';
import { useFormattedStatistics } from '@/hooks/useRoomStatistics';

const RoomInfoPanel = ({ room, initialValues, onEditClick, onRoomUpdate }) => {
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

	// Get statistics from API
	const { statistics, loading: statsLoading, error: statsError } = useFormattedStatistics(
		room?.room_id,
		{
			autoRefresh: true,
			refreshInterval: 30000,
			includeHistory: false,
			enabled: !!room?.room_id
		}
	);

	// Use API data or fallback to empty values
	const currentMetrics = statistics?.current_metrics || {};
	const dailyStats = statistics?.daily_stats || {};
	const financialBreakdown = statistics?.financial_breakdown || {};
	const requirementsStatus = statistics?.requirements_status || {};


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
			console.error('Error al cancelar desactivación:', error);
			toast.error('Error al cancelar la desactivación programada');
		} finally {
			setCancellingDeactivation(false);
		}
	};

	return (
		<PanelContainer>
			{/* Card de Estado Principal */}
			<StatusCard status={statusInfo.color}>
				<StatusHeader>
					<div>
						<StatusBadge status={statusInfo.color}>
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

			{/* Grid de Métricas */}
			<MetricsGrid>
				<MetricCard>
					<MetricLabel>Usuarios Conectados</MetricLabel>
					<MetricValue>
						{statsLoading ? '...' : formatNumber(currentMetrics.connected_users || 0)}
					</MetricValue>
					<MetricSubtitle>de {formatNumber(500)} máximo</MetricSubtitle>
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
						de {formatNumber(currentMetrics.total_cards || 0)} disponibles
					</MetricSubtitle>
					<MetricTrend>
						{currentMetrics.occupancy_formatted || '0%'}
					</MetricTrend>
				</MetricCard>

				<MetricCard>
					<MetricLabel>Recaudación Actual</MetricLabel>
					<MetricValue>
						{statsLoading ? '...' : (currentMetrics.revenue_formatted || formatCurrency(0))}
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
						{statsLoading ? '...' : (currentMetrics.game_status_text || 'Sin juego')}
					</MetricValue>
					{currentMetrics.game_duration_formatted && (
						<MetricSubtitle>Tiempo: {currentMetrics.game_duration_formatted}</MetricSubtitle>
					)}
					<MetricTrend>
						{room.game
							? `Juego #${room.game_id || (room.game?.ref ? room.game.ref.slice(-4) : '1')}`
							: 'Esperando inicio'}
					</MetricTrend>
				</MetricCard>
			</MetricsGrid>

			{/* Sección de Requisitos Mínimos */}
			<RequirementsSection>
				<SectionTitle>📊 Requisitos Mínimos para Iniciar Partida</SectionTitle>

				<ProgressBarContainer>
					<ProgressInfo>
						<ProgressLabel>Cartones mínimos</ProgressLabel>
						<ProgressValues>
							{requirementsStatus.current_cards || 0} / {requirementsStatus.minimum_cards || 0}
						</ProgressValues>
					</ProgressInfo>
					<ProgressBar>
						<ProgressFill
							status={getProgressBarColor(requirementsStatus.percentage_complete || 0)}
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
						<ConfigValue>{formatDate(room.createAt)}</ConfigValue>
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
							{statsLoading ? '...' : (dailyStats.total_revenue_formatted || formatCurrency(0))}
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
