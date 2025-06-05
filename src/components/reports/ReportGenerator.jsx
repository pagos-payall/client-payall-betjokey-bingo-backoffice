import styled from 'styled-components';
import { theme } from '@/data/themes';
import LoadingCircle from '@/components/LoadingCircle';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15px;
`;

const GenerateButton = styled.button`
	background: ${theme.dark.background.accent};
	border: none;
	border-radius: 8px;
	padding: 12px 30px;
	color: white;
	font-size: 1.1rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	gap: 10px;

	&:hover:not(:disabled) {
		background: ${theme.dark.background.hover};
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: ${theme.dark.background.secondary};
	}
`;

const InfoText = styled.p`
	color: ${theme.dark.text.secondary};
	font-size: 0.9rem;
	text-align: center;
	margin: 0;
`;

const WarningText = styled.p`
	color: #ff9800;
	font-size: 0.85rem;
	text-align: center;
	margin: 0;
	padding: 10px;
	background: rgba(255, 152, 0, 0.1);
	border-radius: 6px;
	border: 1px solid rgba(255, 152, 0, 0.3);
`;

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
`;

const LoadingText = styled.p`
	color: ${theme.dark.text.primary};
	font-size: 1rem;
`;

export default function ReportGenerator({ generateReport, loading, filters }) {
	const isDisabled = loading || !filters.startDate || !filters.endDate;

	const handleGenerate = () => {
		if (!isDisabled) {
			generateReport();
		}
	};

	// Calcular días del rango seleccionado
	const calculateDayRange = () => {
		if (filters.startDate && filters.endDate) {
			const start = new Date(filters.startDate);
			const end = new Date(filters.endDate);
			const diffTime = Math.abs(end - start);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
			return diffDays;
		}
		return 0;
	};

	const dayRange = calculateDayRange();
	const isLargeRange = dayRange > 90;

	return (
		<Container>
			{loading ? (
				<LoadingContainer>
					<LoadingCircle />
					<LoadingText>Generando reporte...</LoadingText>
					<InfoText>Esto puede tomar unos segundos</InfoText>
				</LoadingContainer>
			) : (
				<>
					<GenerateButton onClick={handleGenerate} disabled={isDisabled}>
						<span>📥</span>
						Generar y Descargar Reporte
					</GenerateButton>

					{!filters.startDate || !filters.endDate ? (
						<InfoText>
							Por favor, selecciona las fechas de inicio y fin para generar el
							reporte.
						</InfoText>
					) : (
						<>
							<InfoText>
								Período seleccionado: {dayRange}{' '}
								{dayRange === 1 ? 'día' : 'días'}
							</InfoText>
							{isLargeRange && (
								<WarningText>
									⚠️ Has seleccionado un rango amplio de fechas. La generación
									del reporte podría tomar más tiempo.
								</WarningText>
							)}
						</>
					)}

					<InfoText style={{ fontSize: '0.85rem' }}>
						El reporte incluirá todas las partidas del período seleccionado con
						información detallada de ventas, premios e impuestos.
					</InfoText>
				</>
			)}
		</Container>
	);
}
