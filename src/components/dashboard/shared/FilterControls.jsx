// components/dashboard/shared/FilterControls.jsx
'use client';
import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 20px;
	gap: 10px;
	align-items: center;
	background-color: ${theme.dark.background.primary};
	padding: 15px;
	border-radius: 8px;
`;

const Label = styled.label`
	font-size: 14px;
	color: ${theme.dark.text.secondary};
	margin-right: 5px;
`;

const Select = styled.select`
	background-color: ${theme.dark.background.secundary};
	color: ${theme.dark.text.primary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 4px;
	padding: 8px 10px;
	font-size: 14px;
	min-width: 150px;
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: ${theme.dark.text.accent};
	}
`;

const DateInput = styled.input`
	background-color: ${theme.dark.background.secundary};
	color: ${theme.dark.text.primary};
	border: 1px solid ${theme.dark.borders.primary};
	border-radius: 4px;
	padding: 8px 10px;
	font-size: 14px;
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: ${theme.dark.text.accent};
	}

	&::-webkit-calendar-picker-indicator {
		filter: invert(0.8);
	}
`;

const ApplyButton = styled.button`
	background-color: ${theme.dark.background.accent};
	color: ${theme.dark.text.alternative};
	border: none;
	border-radius: 4px;
	padding: 8px 16px;
	cursor: pointer;
	font-weight: bold;
	margin-left: auto;
	transition: all 0.3s ease;

	&:hover {
		background-color: ${theme.dark.background.hover};
		color: ${theme.dark.text.accent};
	}
`;

const FilterGroup = styled.div`
	display: flex;
	align-items: center;
	margin-right: 15px;
`;

const FilterControls = ({
	onApplyFilters,
	showDateRange = true,
	showGranularity = false,
	showRoomFilter = false,
	dateFormat = 'YYYY-MM-DD',
}) => {
	// Default to 30 days ago for start date
	const defaultStartDate = new Date();
	defaultStartDate.setDate(defaultStartDate.getDate() - 30);

	// Format date to YYYY-MM-DD for input fields
	const formatDateForInput = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// State for filter values
	const [startDate, setStartDate] = useState(
		formatDateForInput(defaultStartDate)
	);
	const [endDate, setEndDate] = useState(formatDateForInput(new Date()));
	const [granularity, setGranularity] = useState('day');
	const [roomId, setRoomId] = useState('');

	// Handle filter submission
	const handleApplyFilters = () => {
		if (onApplyFilters) {
			onApplyFilters({
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				granularity,
				roomId: roomId || null,
			});
		}
	};

	return (
		<Container>
			{showDateRange && (
				<>
					<FilterGroup>
						<Label htmlFor='startDate'>Desde:</Label>
						<DateInput
							type='date'
							id='startDate'
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</FilterGroup>

					<FilterGroup>
						<Label htmlFor='endDate'>Hasta:</Label>
						<DateInput
							type='date'
							id='endDate'
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</FilterGroup>
				</>
			)}

			{showGranularity && (
				<FilterGroup>
					<Label htmlFor='granularity'>Agrupación:</Label>
					<Select
						id='granularity'
						value={granularity}
						onChange={(e) => setGranularity(e.target.value)}
					>
						<option value='day'>Diaria</option>
						<option value='week'>Semanal</option>
						<option value='month'>Mensual</option>
					</Select>
				</FilterGroup>
			)}

			{showRoomFilter && (
				<FilterGroup>
					<Label htmlFor='roomId'>Sala:</Label>
					<Select
						id='roomId'
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
					>
						<option value=''>Todas las salas</option>
						<option value='sala1'>Sala 1</option>
						<option value='sala2'>Sala 2</option>
						<option value='sala3'>Sala 3</option>
					</Select>
				</FilterGroup>
			)}

			<ApplyButton onClick={handleApplyFilters}>Aplicar Filtros</ApplyButton>
		</Container>
	);
};

export default FilterControls;
