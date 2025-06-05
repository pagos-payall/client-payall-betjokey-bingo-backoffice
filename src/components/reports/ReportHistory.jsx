import styled from 'styled-components';
import { theme } from '@/data/themes';

const HistoryContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-height: 300px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: ${theme.dark.background.secondary};
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background: ${theme.dark.borders.primary};
		border-radius: 4px;

		&:hover {
			background: ${theme.dark.borders.focus};
		}
	}
`;

const ReportItem = styled.div`
	background: ${theme.dark.background.secondary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 6px;
	padding: 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: all 0.2s;

	&:hover {
		background: ${theme.dark.background.hover};
		border-color: ${theme.dark.borders.focus};
	}
`;

const ReportInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const FileName = styled.span`
	color: ${theme.dark.text.primary};
	font-weight: 500;
	font-size: 0.95rem;
	display: flex;
	align-items: center;
	gap: 5px;
`;

const FileIcon = styled.span`
	font-size: 1.1rem;
`;

const ReportDetails = styled.span`
	color: ${theme.dark.text.secondary};
	font-size: 0.85rem;
`;

const RecordsCount = styled.span`
	color: ${theme.dark.text.primary};
	font-weight: 500;
	font-size: 0.9rem;
	min-width: 100px;
	text-align: right;
`;

const EmptyState = styled.div`
	text-align: center;
	padding: 30px;
	color: ${theme.dark.text.secondary};
`;

export default function ReportHistory({ reports }) {
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatDateRange = (startDate, endDate) => {
		const start = new Date(startDate).toLocaleDateString('es-ES');
		const end = new Date(endDate).toLocaleDateString('es-ES');
		return `${start} - ${end}`;
	};

	const getFileIcon = (format) => {
		return format === 'csv' ? '📄' : '📊';
	};

	if (!reports || reports.length === 0) {
		return <EmptyState>No hay reportes generados en esta sesión</EmptyState>;
	}

	return (
		<HistoryContainer>
			{reports.map((report) => {
				// console.log(report);

				return (
					<ReportItem key={report.id}>
						<ReportInfo>
							<FileName>
								<FileIcon>{getFileIcon(report.format)}</FileIcon>
								{report.filename}
							</FileName>
							<ReportDetails>
								Período: {formatDateRange(report.startDate, report.endDate)}
							</ReportDetails>
							<ReportDetails>Generado: {formatDate(report.date)}</ReportDetails>
						</ReportInfo>
						<RecordsCount>
							{report.totalRecords
								? `${report.totalRecords} registros`
								: 'Sin datos'}
						</RecordsCount>
					</ReportItem>
				);
			})}
		</HistoryContainer>
	);
}
