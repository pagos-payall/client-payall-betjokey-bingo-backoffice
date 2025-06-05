import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import RoomsContext from '@/context/rooms/RoomsContext';

const FiltersContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 15px;
	margin-bottom: 20px;
`;

const FilterGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
`;

const Label = styled.label`
	color: ${theme.dark.text.secondary};
	font-size: 0.9rem;
	font-weight: 500;
`;

const Input = styled.input`
	background: ${theme.dark.background.secondary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 6px;
	padding: 10px;
	color: ${theme.dark.text.primary};
	font-size: 1rem;

	&:focus {
		outline: none;
		border-color: ${theme.dark.borders.focus};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const Select = styled.select`
	background: ${theme.dark.background.secondary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 6px;
	padding: 10px;
	color: ${theme.dark.text.primary};
	font-size: 1rem;
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: ${theme.dark.borders.focus};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const RadioGroup = styled.div`
	display: flex;
	gap: 20px;
	align-items: center;
`;

const RadioLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 5px;
	color: ${theme.dark.text.primary};
	cursor: pointer;

	input {
		cursor: pointer;
	}

	&:hover {
		color: ${theme.dark.text.hover};
	}
`;

const QuickDateButtons = styled.div`
	display: flex;
	gap: 10px;
	margin-top: 10px;
	flex-wrap: wrap;
`;

const QuickDateButton = styled.button`
	background: ${theme.dark.background.secondary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 4px;
	padding: 6px 12px;
	color: ${theme.dark.text.secondary};
	font-size: 0.85rem;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background: ${theme.dark.background.hover};
		color: ${theme.dark.text.primary};
		border-color: ${theme.dark.borders.focus};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const ResetButton = styled.button`
	background: transparent;
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 6px;
	padding: 10px 20px;
	color: ${theme.dark.text.secondary};
	font-size: 1rem;
	cursor: pointer;
	transition: all 0.2s;
	margin-top: 10px;

	&:hover {
		background: ${theme.dark.background.hover};
		color: ${theme.dark.text.primary};
		border-color: ${theme.dark.borders.focus};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export default function ReportFilters({
	filters,
	updateFilters,
	resetFilters,
	setDateRange,
	disabled,
}) {
	const { rooms, getRooms } = useContext(RoomsContext);

	useEffect(() => {
		// Cargar salas si no están cargadas
		if (!rooms || rooms.length === 0) {
			getRooms();
		}
	}, [rooms, getRooms]);

	const handleChange = (field, value) => {
		updateFilters({ [field]: value });
	};

	// Obtener fecha máxima (hoy)
	const today = new Date().toISOString().split('T')[0];

	return (
		<>
			<FiltersContainer>
				{/* Fecha inicio */}
				<FilterGroup>
					<Label htmlFor='startDate'>Fecha de Inicio *</Label>
					<Input
						type='date'
						id='startDate'
						value={filters.startDate}
						onChange={(e) => handleChange('startDate', e.target.value)}
						max={today}
						disabled={disabled}
						required
					/>
				</FilterGroup>

				{/* Fecha fin */}
				<FilterGroup>
					<Label htmlFor='endDate'>Fecha de Fin *</Label>
					<Input
						type='date'
						id='endDate'
						value={filters.endDate}
						onChange={(e) => handleChange('endDate', e.target.value)}
						max={today}
						min={filters.startDate}
						disabled={disabled}
						required
					/>
				</FilterGroup>

				{/* Sala */}
				<FilterGroup>
					<Label htmlFor='roomId'>Sala (Opcional)</Label>
					<Select
						id='roomId'
						value={filters.roomId}
						onChange={(e) => handleChange('roomId', e.target.value)}
						disabled={disabled}
					>
						<option value=''>Todas las salas</option>
						{rooms &&
							rooms.map((room) => (
								<option key={room.room_id} value={room.room_id}>
									{room.room_name}
								</option>
							))}
					</Select>
				</FilterGroup>

				{/* Formato */}
				<FilterGroup>
					<Label>Formato del Reporte</Label>
					<RadioGroup>
						<RadioLabel>
							<input
								type='radio'
								name='format'
								value='xlsx'
								checked={filters.format === 'xlsx'}
								onChange={(e) => handleChange('format', e.target.value)}
								disabled={disabled}
							/>
							Excel (.xlsx)
						</RadioLabel>
						<RadioLabel>
							<input
								type='radio'
								name='format'
								value='csv'
								checked={filters.format === 'csv'}
								onChange={(e) => handleChange('format', e.target.value)}
								disabled={disabled}
							/>
							CSV (.csv)
						</RadioLabel>
					</RadioGroup>
				</FilterGroup>
			</FiltersContainer>

			{/* Botones de rango rápido */}
			<QuickDateButtons>
				<QuickDateButton
					onClick={() => setDateRange('week')}
					disabled={disabled}
				>
					Última semana
				</QuickDateButton>
				<QuickDateButton
					onClick={() => setDateRange('month')}
					disabled={disabled}
				>
					Último mes
				</QuickDateButton>
				<QuickDateButton
					onClick={() => setDateRange('quarter')}
					disabled={disabled}
				>
					Último trimestre
				</QuickDateButton>
				<QuickDateButton
					onClick={() => setDateRange('year')}
					disabled={disabled}
				>
					Último año
				</QuickDateButton>
			</QuickDateButtons>

			{/* Botón de reset */}
			{(filters.startDate || filters.endDate || filters.roomId) && (
				<ResetButton onClick={resetFilters} disabled={disabled}>
					Limpiar filtros
				</ResetButton>
			)}
		</>
	);
}
