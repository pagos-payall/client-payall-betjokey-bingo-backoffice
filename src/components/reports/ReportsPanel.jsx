import { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import useReports from '@/hooks/useReports';
import ReportFilters from './ReportFilters';
import ReportGenerator from './ReportGenerator';
import ReportHistory from './ReportHistory';

const Container = styled.div`
	width: 100%;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

const Card = styled.div`
	background: ${theme.dark.background.tertiary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
	color: ${theme.dark.text.primary};
	font-size: 1.3rem;
	margin-bottom: 15px;
	display: flex;
	align-items: center;
	gap: 10px;
`;

const ServiceStatus = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	background: ${theme.dark.background.secondary};
	border-radius: 6px;
	margin-bottom: 20px;
	font-size: 0.9rem;
	color: ${theme.dark.text.secondary};
`;

const StatusIndicator = styled.div`
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: ${(props) => (props.healthy ? '#4caf50' : '#f44336')};
`;

export default function ReportsPanel() {
	const {
		loading,
		filters,
		updateFilters,
		generateReport,
		resetFilters,
		setDateRange,
		checkServiceHealth,
		healthStatus,
		reportHistory,
	} = useReports();

	useEffect(() => {
		// Verificar el estado del servicio al cargar
		checkServiceHealth();
	}, [checkServiceHealth]);

	return (
		<Container>
			{/* Estado del servicio */}
			{healthStatus && (
				<ServiceStatus>
					<StatusIndicator healthy={healthStatus.status === 'healthy'} />
					<span>
						Servicio de reportes:{' '}
						{healthStatus.status === 'healthy' ? 'Operativo' : 'No disponible'}
					</span>
				</ServiceStatus>
			)}

			{/* Filtros */}
			<Card>
				<Title>Configuración del Reporte</Title>
				<ReportFilters
					filters={filters}
					updateFilters={updateFilters}
					resetFilters={resetFilters}
					setDateRange={setDateRange}
					disabled={loading}
				/>
			</Card>

			{/* Generador */}
			<Card>
				<Title>Generar Reporte</Title>
				<ReportGenerator
					generateReport={generateReport}
					loading={loading}
					filters={filters}
				/>
			</Card>

			{/* Historial */}
			{reportHistory.length > 0 && (
				<Card>
					<Title>Reportes Generados</Title>
					<ReportHistory reports={reportHistory} />
				</Card>
			)}
		</Container>
	);
}
