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
	PieChart,
	Pie,
	Cell,
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

const ChartsContainer = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 20px;
	margin-bottom: 20px;

	@media (max-width: 1200px) {
		grid-template-columns: 1fr;
	}
`;

const COLORS = ['#00B53C', '#EFB810', '#096B2E', '#8A6C16'];

// Formatters
const formatCurrency = (value) => {
	return new Intl.NumberFormat('es-VE', {
		style: 'currency',
		currency: 'VES',
		maximumFractionDigits: 0,
	}).format(value);
};

const formatPercent = (value) => {
	return `${value.toFixed(2)}%`;
};

const FinancialPanel = () => {
	const { fetchAPICall } = useFetch();
	const [financialData, setFinancialData] = useState(null);
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
		granularity: 'day',
	});

	// Load financial data
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);

			try {
				const params = {
					startDate: filters.startDate.toISOString(),
					endDate: filters.endDate.toISOString(),
					granularity: filters.granularity,
				};

				const data = await fetchAPICall(
					'/backOffice/analytics/financeSummary',
					'get',
					params,
					false
				);

				setFinancialData(data.data);
				// setFinancialData(mockFinancialSummary);
			} catch (err) {
				console.error('Error loading financial data:', err);
				setError(
					'Error al cargar los datos financieros. Por favor, intente nuevamente.'
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

	// Prepare chart data
	const getDistributionChartData = () => {
		if (!financialData || !financialData.totales) return [];

		return [
			{ name: 'Bingo', value: financialData.totales.premiosBingo },
			{ name: 'Línea', value: financialData.totales.premiosLinea },
			{ name: 'Impuestos', value: financialData.totales.impuestos },
			{ name: 'Recaudación', value: financialData.totales.recaudacionNeta },
		];
	};

	const getEvolutionChartData = () => {
		if (!financialData || !financialData.distribucionTemporal) return [];

		return financialData.distribucionTemporal.map((item) => ({
			periodo: item.periodo,
			'Recaudación Bruta': item.recaudacionBruta,
			'Total Premios': item.totalPremios,
		}));
	};

	// If loading, show loading state
	if (loading) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showGranularity={true}
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
					showGranularity={true}
					initialStartDate={filters.startDate}
					initialEndDate={filters.endDate}
				/>
				<ErrorState
					message='Error al cargar los datos financieros'
					details={error}
					onRetry={handleRetry}
				/>
			</div>
		);
	}

	// If no data, show empty state
	if (!financialData) {
		return (
			<div>
				<FilterControls
					onApplyFilters={handleApplyFilters}
					showDateRange={true}
					showGranularity={true}
					initialStartDate={filters.startDate}
					initialEndDate={filters.endDate}
				/>
				<ErrorState
					message='No hay datos financieros disponibles'
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
				showGranularity={true}
				initialStartDate={filters.startDate}
				initialEndDate={filters.endDate}
			/>

			{/* KPI Cards */}
			<GridContainer>
				<KPICard
					title='Recaudación Bruta'
					value={financialData.totales.recaudacionBruta}
					trend={financialData.tendencias.recaudacionBruta}
					format={formatCurrency}
				/>
				<KPICard
					title='Total Premios'
					value={financialData.totales.totalPremios}
					trend={financialData.tendencias.totalPremios}
					format={formatCurrency}
				/>
				<KPICard
					title='Ingresos Netos'
					value={financialData.totales.recaudacionNeta}
					trend={financialData.tendencias.recaudacionNeta}
					format={formatCurrency}
				/>
				<KPICard
					title='Margen Promedio'
					value={financialData.totales.margenPromedio}
					trend={financialData.tendencias.margen}
					format={formatPercent}
				/>
			</GridContainer>

			{/* Charts */}
			<ChartsContainer>
				{/* Evolution Chart */}
				<ChartContainer title='Evolución de Ingresos'>
					<ResponsiveContainer width='100%' height={400}>
						<BarChart
							data={getEvolutionChartData()}
							margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
						>
							<CartesianGrid
								strokeDasharray='3 3'
								stroke={theme.dark.borders.secondary}
							/>
							<XAxis
								dataKey='periodo'
								angle={-45}
								textAnchor='end'
								tick={{ fill: theme.dark.text.secondary, fontSize: 12 }}
								stroke={theme.dark.borders.secondary}
								tickMargin={10}
							/>
							<YAxis
								tick={{ fill: theme.dark.text.secondary, fontSize: 12 }}
								stroke={theme.dark.borders.secondary}
								tickFormatter={(value) => {
									if (value >= 1000000)
										return `${(value / 1000000).toFixed(1)}M`;
									if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
									return value;
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: theme.dark.background.primary,
									borderColor: theme.dark.borders.primary,
									color: theme.dark.text.primary,
								}}
								formatter={(value) => [formatCurrency(value), '']}
							/>
							<Legend
								wrapperStyle={{
									color: theme.dark.text.secondary,
									paddingTop: '50px',
								}}
							/>
							<Bar
								dataKey='Recaudación Bruta'
								fill='#00B53C'
								name='Recaudación Bruta'
							/>
							<Bar
								dataKey='Total Premios'
								fill='#EFB810'
								name='Total Premios'
							/>
						</BarChart>
					</ResponsiveContainer>
				</ChartContainer>

				{/* Distribution Chart */}
				<ChartContainer title='Distribución de Ingresos'>
					<ResponsiveContainer width='100%' height={400}>
						<PieChart>
							<Pie
								data={getDistributionChartData()}
								cx='50%'
								cy='50%'
								labelLine={true}
								outerRadius={90}
								innerRadius={30}
								fill='#8884d8'
								dataKey='value'
								nameKey='name'
								label={({ name, percent }) =>
									`${name}: ${(percent * 100).toFixed(0)}%`
								}
								labelPosition='inside'
							>
								{getDistributionChartData().map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: theme.dark.background.primary,
									borderColor: theme.dark.borders.primary,
									color: theme.dark.text.primary,
								}}
								formatter={(value) => [formatCurrency(value), '']}
							/>
							<Legend
								layout='horizontal'
								verticalAlign='bottom'
								align='center'
								wrapperStyle={{
									color: theme.dark.text.secondary,
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</ChartContainer>
			</ChartsContainer>

			{/* Additional section could be added here for top-performing rooms */}
		</div>
	);
};

export default FinancialPanel;
