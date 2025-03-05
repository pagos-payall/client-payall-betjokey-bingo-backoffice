'use client';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import useFetch from '@/hooks/useFetch';
import KPICard from './shared/KPICard';
import ChartContainer from './shared/ChartContainer';
import LoadingState from './shared/LoadingState';
import ErrorState from './shared/ErrorState';
import FilterControls from './shared/FilterControls';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
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

const HeatMapContainer = styled.div`
	margin-bottom: 20px;
`;

const HeatMapRow = styled.div`
	display: flex;
	height: 30px;
`;

const HeatMapCell = styled.div`
	flex: 1;
	background-color: ${(props) => {
		const intensity = props.value / props.maxValue;
		if (intensity < 0.1) return theme.dark.background.primary;
		if (intensity < 0.3) return theme.dark.background.hover;
		if (intensity < 0.5) return theme.dark.background.secondary;
		if (intensity < 0.7) return '#3c703e'; // Medium green
		return theme.dark.background.accent; // Full green
	}};
	margin: 1px;
	border-radius: 2px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	color: ${(props) => {
		const intensity = props.value / props.maxValue;
		return intensity > 0.5
			? theme.dark.text.primary
			: theme.dark.text.secondary;
	}};
`;

const HeatMapLabels = styled.div`
	display: flex;
	margin-top: 10px;
	justify-content: space-between;
	color: ${theme.dark.text.secondary};
	font-size: 12px;
`;

const DayLabel = styled.div`
	width: 30px;
	text-align: right;
	padding-right: 10px;
	line-height: 30px;
	color: ${theme.dark.text.secondary};
	font-size: 12px;
`;

const CountryContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 15px;
	border-bottom: 1px solid ${theme.dark.borders.primary};

	&:last-child {
		border-bottom: none;
	}
`;

const CountryName = styled.div`
	color: ${theme.dark.text.secondary};
`;

const UserCount = styled.div`
	background-color: ${theme.dark.background.secondary};
	color: ${theme.dark.text.accent};
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: bold;
`;

// Formatter
const formatNumber = (value) => {
	return new Intl.NumberFormat('es-VE').format(value);
};

const formatPercent = (value) => {
	return `${parseFloat(value).toFixed(1)}%`;
};

const formatTime = (minutes) => {
	if (minutes < 60) {
		return `${(+minutes).toFixed(1)} min`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins.toFixed(0)}m`;
};

const UserMetricsPanel = () => {
	const { fetchAPICall } = useFetch();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		startDate: (() => {
			const date = new Date();
			date.setDate(date.getDate() - 7);
			return date;
		})(),
		endDate: new Date(),
		interval: 'hour',
	});

	// Load user metrics data
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);

			try {
				const params = {
					startDate: filters.startDate.toISOString(),
					endDate: filters.endDate.toISOString(),
					interval: filters.interval,
				};

				const data = await fetchAPICall(
					'/backOffice/analytics/usersMetrics',
					'get',
					params,
					false
				);

				setUserData(data.data);
				// setUserData(mockUserMetrics);
			} catch (err) {
				console.error('Error loading user metrics data:', err);
				setError(
					'Error al cargar los datos de usuarios. Por favor, intente nuevamente.'
				);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [filters]);

	// Handle filter changes
	const handleApplyFilters = (newFilters) => {
		setFilters({
			...newFilters,
			interval: newFilters.granularity || 'hour',
		});
	};

	// Find the maximum value in the heatmap for scaling
	const findMaxHeatmapValue = () => {
		if (
			!userData ||
			!userData.mapaCalorActividad ||
			!userData.mapaCalorActividad.matrizDatos
		) {
			return 1;
		}

		let max = 0;
		for (const row of userData.mapaCalorActividad.matrizDatos) {
			for (const cell of row) {
				if (cell > max) max = cell;
			}
		}
		return max || 1; // Prevent division by zero
	};

	// If loading, show loading state
	if (loading) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showGranularity={true}
				/>
				<LoadingState type='skeleton' />
			</div>
		);
	}

	// If error, show error state
	if (error) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showGranularity={true}
				/>
				<ErrorState
					message='Error al cargar los datos de usuarios'
					details={error}
					onRetry={() => handleApplyFilters(filters)}
				/>
			</div>
		);
	}

	// If no data, show empty state
	if (!userData) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showGranularity={true}
				/>
				<ErrorState
					message='No hay datos de usuarios disponibles'
					details='Intente cambiar el rango de fechas o verifique la conexión.'
					onRetry={() => handleApplyFilters(filters)}
				/>
			</div>
		);
	}

	// Prepare chart data
	const getChartData = () => {
		if (!userData.evolucionTemporal) return [];

		return userData.evolucionTemporal.map((item) => ({
			periodo: item.periodo,
			usuarios: item.usuariosUnicos,
		}));
	};

	return (
		<div>
			<FilterControls
				onApplyFilters={handleApplyFilters}
				showDateRange={true}
				showGranularity={true}
			/>

			{/* KPI Cards */}
			<GridContainer>
				<KPICard
					title='Usuarios Activos'
					value={userData.metricas_actuales.usuariosActivos}
					format={formatNumber}
				/>
				<KPICard
					title='Nuevos Usuarios (24h)'
					value={userData.metricas_actuales.nuevosUsuarios}
					format={formatNumber}
				/>
				<KPICard
					title='Tasa de Retención'
					value={userData.metricas_actuales.tasaRetencion}
					format={formatPercent}
				/>
				<KPICard
					title='Cartones por Usuario'
					value={userData.metricas_actuales.promedioCartonesUsuario}
					format={(value) => parseFloat(value).toFixed(1)}
				/>
			</GridContainer>

			{/* User Activity Chart */}
			<ChartContainer title='Evolución de Usuarios Activos'>
				<ResponsiveContainer width='100%' height={300}>
					<LineChart
						data={getChartData()}
						margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke={theme.dark.borders.secondary}
						/>
						<XAxis
							dataKey='periodo'
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
							formatter={(value) => [formatNumber(value), 'Usuarios']}
						/>
						<Legend
							wrapperStyle={{
								color: theme.dark.text.secondary,
								paddingTop: '10px',
							}}
						/>
						<Line
							type='monotone'
							dataKey='usuarios'
							name='Usuarios Activos'
							stroke={theme.dark.background.accent}
							activeDot={{ r: 8 }}
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartContainer>

			{/* Activity Heatmap */}
			<ChartContainer title='Actividad por Día y Hora'>
				<HeatMapContainer>
					{userData.mapaCalorActividad &&
						userData.mapaCalorActividad.matrizDatos && (
							<>
								{userData.mapaCalorActividad.matrizDatos.map(
									(row, rowIndex) => (
										<HeatMapRow key={rowIndex}>
											<DayLabel>
												{userData.mapaCalorActividad.dias[rowIndex]}
											</DayLabel>
											{row.map((cell, cellIndex) => (
												<HeatMapCell
													key={cellIndex}
													value={cell}
													maxValue={findMaxHeatmapValue()}
													title={`${userData.mapaCalorActividad.dias[rowIndex]} ${userData.mapaCalorActividad.horas[cellIndex]}: ${cell} eventos`}
												>
													{cell > 0 ? cell : ''}
												</HeatMapCell>
											))}
										</HeatMapRow>
									)
								)}
								<HeatMapLabels>
									{userData.mapaCalorActividad.horas
										.filter((_, i) => i % 4 === 0)
										.map((hour, index) => (
											<span key={index}>{hour}</span>
										))}
								</HeatMapLabels>
							</>
						)}
				</HeatMapContainer>
			</ChartContainer>

			{/* Geographic Distribution */}
			{userData.distribucionGeografica &&
				userData.distribucionGeografica.length > 0 && (
					<ChartContainer title='Distribución Geográfica'>
						{userData.distribucionGeografica.map((country, index) => (
							<CountryContainer key={index}>
								<CountryName>{country.pais}</CountryName>
								<UserCount>{formatNumber(country.usuarios)} usuarios</UserCount>
							</CountryContainer>
						))}
					</ChartContainer>
				)}

			{/* Session Time */}
			{userData.metricas_actuales.tiempoPromedioSesion && (
				<ChartContainer title='Tiempo Promedio de Sesión'>
					<div style={{ textAlign: 'center', padding: '20px' }}>
						<div
							style={{
								fontSize: '48px',
								fontWeight: 'bold',
								color: theme.dark.text.accent,
							}}
						>
							{formatTime(userData.metricas_actuales.tiempoPromedioSesion)}
						</div>
						<div
							style={{ color: theme.dark.text.secondary, marginTop: '10px' }}
						>
							Tiempo promedio que los usuarios permanecen activos
						</div>
					</div>
				</ChartContainer>
			)}
		</div>
	);
};

export default UserMetricsPanel;
