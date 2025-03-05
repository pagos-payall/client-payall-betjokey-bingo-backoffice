'use client';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import useFetch from '@/hooks/useFetch';
import KPICard from './shared/KPICard';
import ChartContainer from './shared/ChartContainer';
import LoadingState from './shared/LoadingState';
import ErrorState from './shared/ErrorState';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	AreaChart,
	Area,
} from 'recharts';

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20px;
	margin-bottom: 20px;

	@media (max-width: 1200px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
`;

const ServicesGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 20px;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
`;

const ServiceCard = styled.div`
	background-color: ${theme.dark.background.primary};
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const ServiceName = styled.div`
	font-size: 16px;
	font-weight: bold;
	color: ${theme.dark.text.primary};
	margin-bottom: 10px;
`;

const StatusIndicator = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background-color: ${(props) =>
		props.status ? theme.dark.success : theme.dark.error};
	color: white;
	font-weight: bold;
	margin-bottom: 10px;
`;

const StatusText = styled.div`
	font-size: 14px;
	text-align: center;
	color: ${(props) => (props.status ? theme.dark.success : theme.dark.error)};
`;

const AlertsContainer = styled.div`
	margin-bottom: 20px;
`;

const Alert = styled.div`
	background-color: ${(props) => {
		if (props.type === 'error') return 'rgba(242, 92, 120, 0.2)'; // Red
		if (props.type === 'warning') return 'rgba(242, 175, 92, 0.2)'; // Yellow
		return 'rgba(43, 217, 153, 0.2)'; // Green (info)
	}};
	border-left: 4px solid
		${(props) => {
			if (props.type === 'error') return theme.dark.error;
			if (props.type === 'warning') return theme.dark.warning;
			return theme.dark.success;
		}};
	border-radius: 4px;
	padding: 15px;
	margin-bottom: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const AlertIcon = styled.div`
	margin-right: 15px;
	font-size: 20px;
`;

const AlertContent = styled.div`
	flex: 1;
`;

const AlertTitle = styled.div`
	font-weight: bold;
	color: ${theme.dark.text.primary};
	margin-bottom: 5px;
`;

const AlertMessage = styled.div`
	color: ${theme.dark.text.secondary};
	font-size: 14px;
`;

const AlertTime = styled.div`
	color: ${theme.dark.text.secondary};
	font-size: 12px;
	margin-left: 15px;
	white-space: nowrap;
`;

const MetricRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;
	border-bottom: 1px solid ${theme.dark.borders.primary};

	&:last-child {
		border-bottom: none;
	}
`;

const MetricName = styled.div`
	color: ${theme.dark.text.secondary};
`;

const MetricValue = styled.div`
	font-weight: bold;
	color: ${theme.dark.text.primary};
	text-align: right;
`;

// Formatters
const formatTime = (milliseconds) => {
	const seconds = Math.floor(milliseconds / 1000);
	if (seconds < 60) return `${seconds} seg`;

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} min`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} h`;

	const days = Math.floor(hours / 24);
	return `${days} días`;
};

const formatPercent = (value) => {
	return `${parseFloat(value).toFixed(1)}%`;
};

const formatNumber = (value) => {
	return new Intl.NumberFormat('es-VE').format(value);
};

const formatTimeAgo = (date) => {
	const now = new Date();
	const diff = now - new Date(date);

	const minutes = Math.floor(diff / 60000);
	if (minutes < 60) return `hace ${minutes} min`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `hace ${hours} h`;

	const days = Math.floor(hours / 24);
	return `hace ${days} días`;
};

const SystemStatusPanel = () => {
	const { fetchAPICall } = useFetch();
	const [systemData, setSystemData] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refreshInterval, setRefreshInterval] = useState(null);

	// Load system status data
	const loadSystemData = async () => {
		setLoading(true);
		setError(null);

		try {
			const data = await fetchAPICall(
				'/backOffice/analytics/systemStatus',
				'get',
				{},
				false
			);
			setSystemData(data.data);

			setRefreshKey((prevKey) => prevKey + 1);

			console.log(data.data.servicios.servidores);

			// setSystemData(mockSystemStatus);
		} catch (err) {
			console.error('Error loading system status data:', err);
			setError(
				'Error al cargar los datos del estado del sistema. Por favor, intente nuevamente.'
			);
		} finally {
			setLoading(false);
		}
	};

	// Load data on component mount
	useEffect(() => {
		loadSystemData();

		// Set up refresh interval (every 60 seconds)
		const interval = setInterval(() => {
			loadSystemData();
		}, 60000);

		setRefreshInterval(interval);

		// Clear interval on component unmount
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		};
	}, []);

	// Get alert icon based on type
	const getAlertIcon = (type) => {
		if (type === 'error') return '⚠️';
		if (type === 'warning') return '⚠️';
		return 'ℹ️';
	};

	// Prepare chart data
	const getPerformanceChartData = () => {
		if (!systemData || !systemData.rendimiento_historico) return [];

		return systemData.rendimiento_historico.timestamps.map((time, index) => ({
			time: new Date(time).toLocaleTimeString(),
			cpu: systemData.rendimiento_historico.cpu[index],
			memoria: systemData.rendimiento_historico.memoria[index],
			respuesta: systemData.rendimiento_historico.respuesta[index],
		}));
	};

	// If loading, show loading state
	if (loading && !systemData) {
		return <LoadingState type='skeleton' />;
	}

	// If error, show error state
	if (error && !systemData) {
		return (
			<ErrorState
				message='Error al cargar los datos del estado del sistema'
				details={error}
				onRetry={loadSystemData}
			/>
		);
	}

	// If no data, show empty state
	if (!systemData) {
		return (
			<ErrorState
				message='No hay datos del estado del sistema disponibles'
				details='Intente nuevamente más tarde o verifique la conexión.'
				onRetry={loadSystemData}
			/>
		);
	}

	return (
		<div>
			{loading && (
				<div
					style={{
						textAlign: 'center',
						padding: '10px',
						color: theme.dark.text.secondary,
						marginBottom: '10px',
					}}
				>
					Actualizando datos...
				</div>
			)}

			{/* State Overview */}
			<ChartContainer>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: '10px',
					}}
				>
					<h3 style={{ margin: 0 }}>Estado del Sistema</h3>
					<div
						style={{
							backgroundColor:
								systemData.estado_general.nivelAlerta === 'critical'
									? theme.dark.error
									: systemData.estado_general.nivelAlerta === 'warning'
									? theme.dark.warning
									: theme.dark.success,
							color: 'white',
							padding: '4px 12px',
							borderRadius: '20px',
							fontSize: '12px',
							fontWeight: 'bold',
						}}
					>
						{systemData.estado_general.nivelAlerta === 'critical'
							? 'CRÍTICO'
							: systemData.estado_general.nivelAlerta === 'warning'
							? 'ADVERTENCIA'
							: 'NORMAL'}
					</div>
				</div>

				<div
					style={{
						backgroundColor:
							systemData.estado_general.nivelAlerta === 'critical'
								? 'rgba(242, 92, 120, 0.1)'
								: systemData.estado_general.nivelAlerta === 'warning'
								? 'rgba(242, 175, 92, 0.1)'
								: 'rgba(43, 217, 153, 0.1)',
						padding: '10px 15px',
						borderRadius: '4px',
						color: theme.dark.text.secondary,
						marginBottom: '20px',
					}}
				>
					{systemData.estado_general.mensaje}
				</div>

				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						color: theme.dark.text.secondary,
						fontSize: '12px',
					}}
				>
					<div>
						Última actualización:{' '}
						{new Date(systemData.timestamp).toLocaleString()}
					</div>
					<div style={{ cursor: 'pointer' }} onClick={loadSystemData}>
						Actualizar ahora
					</div>
				</div>
			</ChartContainer>

			{/* KPI Cards */}
			<GridContainer>
				<KPICard
					title='Disponibilidad'
					value={systemData.estado_general.disponibilidad}
					format={formatPercent}
				/>
				<KPICard
					title='Carga del Sistema'
					value={systemData.metricas_rendimiento.cargaSistema}
					format={formatPercent}
				/>
				<KPICard
					title='Uso de Memoria'
					value={systemData.metricas_rendimiento.usoMemoria}
					format={formatPercent}
				/>
				<KPICard
					title='Tiempo de Respuesta'
					value={systemData.metricas_rendimiento.tiempoRespuesta.promedio}
					format={(value) => `${value} ms`}
				/>
			</GridContainer>

			{/* Services Status */}
			<ChartContainer title='Estado de Servicios'>
				<ServicesGrid key={refreshKey}>
					{/* Database Services */}
					<ServiceCard>
						<ServiceName>Base de Datos</ServiceName>
						<StatusIndicator status={systemData.servicios.baseDatos.main}>
							{systemData.servicios.baseDatos.main ? 'OK' : 'ERROR'}
						</StatusIndicator>
						<StatusText status={systemData.servicios.baseDatos.main}>
							{systemData.servicios.baseDatos.main
								? 'Funcionando correctamente'
								: 'Servicio interrumpido'}
						</StatusText>
					</ServiceCard>

					{/* Web Server */}
					<ServiceCard>
						<ServiceName>Servidor Web</ServiceName>
						<StatusIndicator status={systemData.servicios.servidores.web}>
							{systemData.servicios.servidores.web ? 'OK' : 'ERROR'}
						</StatusIndicator>
						<StatusText status={systemData.servicios.servidores.web}>
							{systemData.servicios.servidores.web
								? 'Funcionando correctamente'
								: 'Servicio interrumpido'}
						</StatusText>
					</ServiceCard>

					{/* WebSocket Server */}
					<ServiceCard>
						<ServiceName>Servidor WS</ServiceName>
						<StatusIndicator status={systemData.servicios.servidores.websocket}>
							{systemData.servicios.servidores.websocket ? 'OK' : 'ERROR'}
						</StatusIndicator>
						<StatusText status={systemData.servicios.servidores.websocket}>
							{systemData.servicios.servidores.websocket
								? 'Funcionando correctamente'
								: 'Servicio interrumpido'}
						</StatusText>
					</ServiceCard>
				</ServicesGrid>
			</ChartContainer>

			{/* Performance Chart */}
			<ChartContainer title='Rendimiento del Sistema'>
				<ResponsiveContainer width='100%' height={300}>
					<AreaChart
						data={getPerformanceChartData()}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke={theme.dark.borders.secondary}
						/>
						<XAxis
							dataKey='time'
							tick={{ fill: theme.dark.text.secondary, fontSize: 12 }}
							stroke={theme.dark.borders.secondary}
						/>
						<YAxis
							tick={{ fill: theme.dark.text.secondary, fontSize: 12 }}
							stroke={theme.dark.borders.secondary}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: theme.dark.background.primary,
								borderColor: theme.dark.borders.primary,
								color: theme.dark.text.primary,
							}}
							formatter={(value, name) => {
								if (name === 'cpu') return [formatPercent(value), 'CPU'];
								if (name === 'memoria')
									return [formatPercent(value), 'Memoria'];
								if (name === 'respuesta')
									return [`${value} ms`, 'Tiempo de respuesta'];
								return [value, name];
							}}
						/>
						<Legend
							wrapperStyle={{
								color: theme.dark.text.secondary,
								paddingTop: '10px',
							}}
						/>
						<Area
							type='monotone'
							dataKey='cpu'
							name='CPU'
							stroke='#00B53C'
							fill='rgba(0, 181, 60, 0.2)'
						/>
						<Area
							type='monotone'
							dataKey='memoria'
							name='Memoria'
							stroke='#F2AF5C'
							fill='rgba(242, 175, 92, 0.2)'
						/>
						<Line
							type='monotone'
							dataKey='respuesta'
							name='Tiempo de respuesta'
							stroke='#F25C78'
							strokeWidth={2}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</ChartContainer>

			{/* Alerts */}
			<ChartContainer title='Alertas Recientes'>
				<AlertsContainer>
					{systemData.alertas_recientes.length > 0 ? (
						systemData.alertas_recientes.map((alerta, index) => (
							<Alert key={index} type={alerta.tipo}>
								<AlertIcon>{getAlertIcon(alerta.tipo)}</AlertIcon>
								<AlertContent>
									<AlertTitle>{alerta.mensaje}</AlertTitle>
									<AlertMessage>{alerta.detalles}</AlertMessage>
								</AlertContent>
								<AlertTime>{formatTimeAgo(alerta.timestamp)}</AlertTime>
							</Alert>
						))
					) : (
						<div
							style={{
								textAlign: 'center',
								padding: '20px',
								color: theme.dark.text.secondary,
							}}
						>
							No hay alertas recientes
						</div>
					)}
				</AlertsContainer>
			</ChartContainer>

			{/* System Statistics */}
			<ChartContainer title='Estadísticas Adicionales'>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '20px',
					}}
				>
					{/* System Usage */}
					<div>
						<h4 style={{ color: theme.dark.text.primary, marginTop: 0 }}>
							Uso del Sistema
						</h4>
						<MetricRow>
							<MetricName>Uptime</MetricName>
							<MetricValue>
								{formatTime(
									systemData.metricas_rendimiento.uptime * 3600 * 1000
								)}
							</MetricValue>
						</MetricRow>
						<MetricRow>
							<MetricName>Salas Activas</MetricName>
							<MetricValue>
								{formatNumber(systemData.estadisticas.salasActivas)}
							</MetricValue>
						</MetricRow>
						<MetricRow>
							<MetricName>Juegos Activos</MetricName>
							<MetricValue>
								{formatNumber(systemData.estadisticas.juegosActivos)}
							</MetricValue>
						</MetricRow>
						<MetricRow>
							<MetricName>Juegos en Espera</MetricName>
							<MetricValue>
								{formatNumber(systemData.estadisticas.juegosEsperando)}
							</MetricValue>
						</MetricRow>
						<MetricRow>
							<MetricName>Sesiones Activas</MetricName>
							<MetricValue>
								{formatNumber(systemData.estadisticas.sesionesActivas)}
							</MetricValue>
						</MetricRow>
					</div>

					{/* Transactions */}
					<div>
						<h4 style={{ color: theme.dark.text.primary, marginTop: 0 }}>
							Transacciones Pendientes
						</h4>
						<MetricRow>
							<MetricName>Pagos Pendientes</MetricName>
							<MetricValue>
								{formatNumber(
									systemData.estadisticas.transaccionesPendientes
										.pagosPendientes
								)}
							</MetricValue>
						</MetricRow>
					</div>
				</div>
			</ChartContainer>
		</div>
	);
};

export default SystemStatusPanel;
