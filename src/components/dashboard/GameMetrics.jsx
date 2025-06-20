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
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	Cell,
} from 'recharts';
import { mockGameAnalytics } from './mockedResponse';
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

const ChartsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	margin-bottom: 20px;

	@media (max-width: 1200px) {
		grid-template-columns: 1fr;
	}
`;

const NumberGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(10, 1fr);
	gap: 5px;
	margin-bottom: 20px;
`;

const NumberCell = styled.div`
	background-color: ${(props) =>
		props.highlighted
			? theme.dark.background.accent
			: theme.dark.background.primary};
	color: ${(props) =>
		props.highlighted ? 'white' : theme.dark.text.secondary};
	border: 1px solid
		${(props) =>
			props.highlighted
				? theme.dark.background.accent
				: theme.dark.borders.primary};
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 30px;
	font-size: 12px;
	position: relative;

	&::after {
		content: '${(props) => (props.percentage ? props.percentage + '%' : '')}';
		position: absolute;
		bottom: -15px;
		font-size: 8px;
		color: ${theme.dark.text.secondary};
	}
`;

const BallContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	justify-content: center;
	margin-bottom: 20px;
`;

const Ball = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: ${(props) =>
		props.active
			? theme.dark.background.accent
			: theme.dark.background.primary};
	color: ${(props) => (props.active ? 'white' : theme.dark.text.secondary)};
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	position: relative;

	&::after {
		content: '${(props) => props.percentage}%';
		position: absolute;
		bottom: -15px;
		font-size: 10px;
		color: ${theme.dark.text.secondary};
	}
`;

// Formatters
const formatNumber = (value) => {
	return new Intl.NumberFormat('es-VE').format(value);
};

const formatTime = (minutes = 0) => {
	if (!minutes) minutes = 0;
	if (minutes < 60) {
		return `${minutes.toFixed(1)} min`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins.toFixed(0)}m`;
};

const formatPercent = (value) => {
	return `${parseFloat(value).toFixed(1)}%`;
};

const GameAnalyticsPanel = () => {
	const { fetchAPICall } = useFetch();
	const [gameData, setGameData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);
	const [filters, setFilters] = useState({
		startDate: (() => {
			const date = new Date();
			date.setMonth(date.getMonth() - 1);
			date.setHours(0, 0, 0, 0);
			return date;
		})(),
		endDate: new Date(),
		roomId: null,
	});

	// Load game analytics data
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);

			try {
				const params = {
					startDate: filters.startDate.toISOString(),
					endDate: filters.endDate.toISOString(),
					roomId: filters.roomId,
				};

				const data = await fetchAPICall(
					'/backOffice/analytics/gameAnalytics',
					'get',
					params,
					false
				);

				setGameData(data.data);
				// setGameData(mockGameAnalytics);
			} catch (err) {
				console.error('Error loading game analytics data:', err);
				setError(
					'Error al cargar los datos de análisis de juego. Por favor, intente nuevamente.'
				);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [filters, retryCount]);

	// Handle filter changes
	const handleApplyFilters = (newFilters) => {
		setFilters(newFilters);
	};

	// Handle retry
	const handleRetry = () => {
		setRetryCount(prev => prev + 1);
	};

	// Prepare data for number distribution chart
	const getNumberDistributionData = () => {
		if (
			!gameData ||
			!gameData.distribucion_numeros ||
			!gameData.distribucion_numeros.porRango
		) {
			return [];
		}

		return gameData.distribucion_numeros.porRango.map((rangoData) => ({
			rango: rangoData.rango,
			frecuencia: rangoData.frecuenciaPromedio,
			porcentaje: rangoData.porcentajePromedio,
		}));
	};

	// If loading, show loading state
	if (loading) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showRoomFilter={true}
					initialStartDate={filters.startDate}
					initialEndDate={filters.endDate}
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
					showRoomFilter={true}
					initialStartDate={filters.startDate}
					initialEndDate={filters.endDate}
				/>
				<ErrorState
					message='Error al cargar los datos de análisis de juego'
					details={error}
					onRetry={handleRetry}
				/>
			</div>
		);
	}

	// If no data, show empty state
	if (!gameData) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showRoomFilter={true}
					initialStartDate={filters.startDate}
					initialEndDate={filters.endDate}
				/>
				<ErrorState
					message='No hay datos de análisis de juego disponibles'
					details='Intente cambiar el rango de fechas o verifique la conexión.'
					onRetry={handleRetry}
				/>
			</div>
		);
	}

	return (
		<div>
			<FilterControls
				onApplyFilters={handleApplyFilters}
				showDateRange={true}
				showRoomFilter={true}
				initialStartDate={filters.startDate}
				initialEndDate={filters.endDate}
			/>

			{/* KPI Cards */}
			<GridContainer>
				<KPICard
					title='Victorias Compartidas'
					value={
						gameData.metricas_victoria.porcentajeVictoriasCompartidas.total
					}
					format={formatPercent}
				/>
				<KPICard
					title='Tiempo a Primera Línea'
					value={gameData.metricas_victoria.tiempoPromedio.hastaLinea}
					format={(value) => formatTime(value)}
				/>
				<KPICard
					title='Tiempo a Bingo'
					value={gameData.metricas_victoria.tiempoPromedio.hastaBingo}
					format={(value) => formatTime(value)}
				/>
				<KPICard
					title='Bolas por Juego'
					value={gameData.metricas_victoria.promedioBolasPorJuego}
					format={formatNumber}
				/>
			</GridContainer>

			{/* Distribution Chart */}
			<ChartContainer title='Distribución de Números por Rango'>
				<ResponsiveContainer width='100%' height={300}>
					<BarChart
						data={getNumberDistributionData()}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke={theme.dark.borders.secondary}
						/>
						<XAxis
							dataKey='rango'
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
								if (name === 'frecuencia')
									return [formatNumber(value || 0), 'Frecuencia Promedio'];
								if (name === 'porcentaje')
									return [formatPercent(value || 0), 'Porcentaje'];
								return [value, name];
							}}
						/>
						<Legend
							wrapperStyle={{
								color: theme.dark.text.secondary,
								paddingTop: '10px',
							}}
						/>
						<Bar
							dataKey='frecuencia'
							name='Frecuencia Promedio'
							fill='#00B53C'
						/>
					</BarChart>
				</ResponsiveContainer>
			</ChartContainer>

			{/* Top Numbers */}
			<ChartsContainer>
				{/* Most Frequent Numbers */}
				<ChartContainer title='Números Más Frecuentes'>
					<BallContainer>
						{gameData.distribucion_numeros.top.masFrecuentes.map(
							(item, index) => (
								<Ball
									key={index}
									active={true}
									percentage={item.porcentaje.toFixed(1)}
								>
									{item.numero}
								</Ball>
							)
						)}
					</BallContainer>
				</ChartContainer>

				{/* Least Frequent Numbers */}
				<ChartContainer title='Números Menos Frecuentes'>
					<BallContainer>
						{gameData.distribucion_numeros.top.menosFrecuentes.map(
							(item, index) => (
								<Ball
									key={index}
									active={false}
									percentage={item.porcentaje.toFixed(1)}
								>
									{item.numero}
								</Ball>
							)
						)}
					</BallContainer>
				</ChartContainer>
			</ChartsContainer>

			{/* Full Number Distribution */}
			<ChartContainer title='Distribución de Todos los Números (1-90)'>
				<NumberGrid>
					{gameData.distribucion_numeros.completa.map((item, index) => (
						<NumberCell
							key={index}
							highlighted={
								item.frecuencia >=
								(gameData.distribucion_numeros.top.masFrecuentes[4]
									?.frecuencia || 0)
							}
							percentage={
								item.porcentaje > 0 ? item.porcentaje.toFixed(1) : null
							}
						>
							{item.numero}
						</NumberCell>
					))}
				</NumberGrid>
			</ChartContainer>

			{/* Active Games */}
			{gameData.juegos_activos && gameData.juegos_activos.length > 0 && (
				<ChartContainer title='Juegos Activos'>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								<th
									style={{
										textAlign: 'left',
										padding: '10px',
										borderBottom: `1px solid ${theme.dark.borders.primary}`,
										color: theme.dark.text.primary,
									}}
								>
									Sala
								</th>
								<th
									style={{
										textAlign: 'left',
										padding: '10px',
										borderBottom: `1px solid ${theme.dark.borders.primary}`,
										color: theme.dark.text.primary,
									}}
								>
									Estado
								</th>
								<th
									style={{
										textAlign: 'left',
										padding: '10px',
										borderBottom: `1px solid ${theme.dark.borders.primary}`,
										color: theme.dark.text.primary,
									}}
								>
									Duración
								</th>
								<th
									style={{
										textAlign: 'left',
										padding: '10px',
										borderBottom: `1px solid ${theme.dark.borders.primary}`,
										color: theme.dark.text.primary,
									}}
								>
									Bolas
								</th>
								<th
									style={{
										textAlign: 'left',
										padding: '10px',
										borderBottom: `1px solid ${theme.dark.borders.primary}`,
										color: theme.dark.text.primary,
									}}
								>
									Ganadores
								</th>
							</tr>
						</thead>
						<tbody>
							{gameData.juegos_activos.map((juego, index) => (
								<tr key={index}>
									<td
										style={{
											padding: '10px',
											borderBottom: `1px solid ${theme.dark.borders.primary}`,
											color: theme.dark.text.secondary,
										}}
									>
										{juego.roomId}
									</td>
									<td
										style={{
											padding: '10px',
											borderBottom: `1px solid ${theme.dark.borders.primary}`,
											color: theme.dark.text.secondary,
										}}
									>
										{juego.estado}
									</td>
									<td
										style={{
											padding: '10px',
											borderBottom: `1px solid ${theme.dark.borders.primary}`,
											color: theme.dark.text.secondary,
										}}
									>
										{formatTime(juego.duracion)}
									</td>
									<td
										style={{
											padding: '10px',
											borderBottom: `1px solid ${theme.dark.borders.primary}`,
											color: theme.dark.text.secondary,
										}}
									>
										{juego.bolasExtraidas}
									</td>
									<td
										style={{
											padding: '10px',
											borderBottom: `1px solid ${theme.dark.borders.primary}`,
											color: theme.dark.text.secondary,
										}}
									>
										{juego.tieneGanadorLinea && 'Línea '}
										{juego.tieneGanadorBingo && 'Bingo'}
										{!juego.tieneGanadorLinea &&
											!juego.tieneGanadorBingo &&
											'-'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</ChartContainer>
			)}
		</div>
	);
};

export default GameAnalyticsPanel;
