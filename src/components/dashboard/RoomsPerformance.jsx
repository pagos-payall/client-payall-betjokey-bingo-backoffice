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

const TableContainer = styled.div`
	background-color: ${theme.dark.background.primary};
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 20px;
	overflow-x: auto;
`;

const StyledTable = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

const TableHeader = styled.th`
	text-align: left;
	padding: 12px 15px;
	background-color: ${theme.dark.background.secondary};
	color: ${theme.dark.text.primary};
	font-weight: bold;
	border-bottom: 1px solid ${theme.dark.borders.primary};
`;

const TableRow = styled.tr`
	&:nth-child(odd) {
		background-color: ${theme.dark.background.primary};
	}

	&:nth-child(even) {
		background-color: ${theme.dark.background.hover};
	}

	&:hover {
		background-color: ${theme.dark.background.secondary};
	}
`;

const TableCell = styled.td`
	padding: 10px 15px;
	border-bottom: 1px solid ${theme.dark.borders.primary};
	color: ${theme.dark.text.secondary};
`;

const StatusIndicator = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: ${(props) =>
		props.status === 'active'
			? theme.dark.success
			: props.status === 'waiting'
			? theme.dark.warning
			: theme.dark.text.secondary};
	margin-right: 8px;
`;

// Formatters
const formatNumber = (value) => {
	return new Intl.NumberFormat('es-VE').format(value);
};

const formatCurrency = (value) => {
	return new Intl.NumberFormat('es-VE', {
		style: 'currency',
		currency: 'VES',
		maximumFractionDigits: 0,
	}).format(value);
};

const formatTime = (minutes) => {
	if (minutes < 60) {
		return `${minutes.toFixed(1)} min`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins.toFixed(0)}m`;
};

const RoomPerformancePanel = () => {
	const { fetchAPICall } = useFetch();
	const [roomData, setRoomData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		startDate: (() => {
			const date = new Date();
			date.setDate(date.getDate() - 7);
			return date;
		})(),
		endDate: new Date(),
		roomId: null,
	});

	// Load room performance data
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
					'/backOffice/analytics/roomPerformance',
					'get',
					params,
					false
				);

				setRoomData(data.data);
				// setRoomData(mockRoomPerformance);
			} catch (err) {
				console.error('Error loading room performance data:', err);
				setError(
					'Error al cargar los datos de rendimiento de salas. Por favor, intente nuevamente.'
				);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [filters]);

	// Handle filter changes
	const handleApplyFilters = (newFilters) => {
		setFilters(newFilters);
	};

	// If loading, show loading state
	if (loading) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showRoomFilter={true}
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
				/>
				<ErrorState
					message='Error al cargar los datos de rendimiento de salas'
					details={error}
					onRetry={() => handleApplyFilters(filters)}
				/>
			</div>
		);
	}

	// If no data, show empty state
	if (!roomData) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showRoomFilter={true}
				/>
				<ErrorState
					message='No hay datos de rendimiento de salas disponibles'
					details='Intente cambiar el rango de fechas o verifique la conexión.'
					onRetry={() => handleApplyFilters(filters)}
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
			/>

			{/* KPI Cards */}
			<GridContainer>
				<KPICard
					title='Partidas Completadas'
					value={roomData.metricas_globales.totalPartidas}
					format={formatNumber}
				/>
				<KPICard
					title='Tiempo Promedio por Partida'
					value={roomData.metricas_globales.tiempoPromedioPartida}
					format={(value) => formatTime(parseFloat(value))}
				/>
				<KPICard
					title='Cartones Promedio'
					value={roomData.metricas_globales.promedioCartonesVendidos}
					format={formatNumber}
				/>
				<KPICard
					title='Total Cartones Vendidos'
					value={roomData.metricas_globales.totalCartonesVendidos}
					format={formatNumber}
				/>
			</GridContainer>

			{/* Active Rooms Table */}
			<TableContainer>
				<h3>Salas Activas</h3>
				<StyledTable>
					<thead>
						<tr>
							<TableHeader>Sala</TableHeader>
							<TableHeader>Estado</TableHeader>
							<TableHeader>Usuarios</TableHeader>
							<TableHeader>Ocupación</TableHeader>
							<TableHeader>Cartones</TableHeader>
							<TableHeader>Precio Cartón</TableHeader>
						</tr>
					</thead>
					<tbody>
						{roomData.salas_activas.map((sala) => (
							<TableRow key={sala.id}>
								<TableCell>
									<strong>{sala.nombre}</strong>
								</TableCell>
								<TableCell>
									<StatusIndicator status={sala.estado} />
									{sala.estado === 'active'
										? 'Activa'
										: sala.estado === 'waiting'
										? 'Esperando'
										: 'Inactiva'}
								</TableCell>
								<TableCell>{formatNumber(sala.usuariosConectados)}</TableCell>
								<TableCell>{sala.porcentajeOcupacion}%</TableCell>
								<TableCell>{formatNumber(sala.cartonesVendidos)}</TableCell>
								<TableCell>
									{sala.configuracion?.precioCarton
										? formatCurrency(sala.configuracion.precioCarton)
										: '—'}
								</TableCell>
							</TableRow>
						))}
					</tbody>
				</StyledTable>
			</TableContainer>

			{/* Top Rooms by Performance */}
			<ChartContainer title='Ranking de Salas por Rendimiento'>
				<ResponsiveContainer width='100%' height={400}>
					<BarChart
						data={roomData.ranking_salas}
						margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke={theme.dark.borders.secondary}
						/>
						<XAxis
							dataKey='nombreSala'
							angle={-45}
							textAnchor='end'
							tick={{ fill: theme.dark.text.secondary, fontSize: 12 }}
							stroke={theme.dark.borders.secondary}
							tickMargin={10}
						/>
						<YAxis
							yAxisId='left'
							tick={{ fill: theme.dark.text.secondary, fontSize: 12 }}
							stroke={theme.dark.borders.secondary}
							tickFormatter={(value) => {
								if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
								if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
								return value;
							}}
						/>
						<YAxis
							yAxisId='right'
							orientation='right'
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
								if (name === 'cartonesVendidos')
									return [formatNumber(value), 'Cartones'];
								if (name === 'partidasCompletadas')
									return [formatNumber(value), 'Partidas'];
								if (name === 'premiosTotales')
									return [formatCurrency(value), 'Premios'];
								return [value, name];
							}}
						/>
						<Legend
							wrapperStyle={{
								color: theme.dark.text.secondary,
								paddingTop: '50px',
								paddingBottom: '00px',
							}}
						/>
						<Bar
							dataKey='cartonesVendidos'
							name='Cartones Vendidos'
							fill='#00B53C'
							yAxisId='left'
						/>
						<Bar
							dataKey='partidasCompletadas'
							name='Partidas Completadas'
							fill='#F2AF5C'
							yAxisId='right'
						/>
					</BarChart>
				</ResponsiveContainer>
			</ChartContainer>
		</div>
	);
};

export default RoomPerformancePanel;
