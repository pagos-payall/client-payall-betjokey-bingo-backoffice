'use client';
import styled from 'styled-components';
import { theme } from '../../data/themes';
import SearchBar from '../SearchBar';
import MenuOption from '../MenuOption';
import Separator from '../Separator';
import SalaMenuCardEnhanced from '../SalaMenuCardEnhanced';
import {
	addIcon,
	archiveStorageIcon,
	boltIcon,
	refreshIcon,
	settingsIcon,
} from '@/data/icons';
import RoomsContext from '@/context/rooms/RoomsContext';
import { useContext, useEffect, useState } from 'react';
import NoInfoComp from '../NoInfoComp';
import SubHeaderBar from '../SubHeaderBar';
import { useDebounce } from '@/services/useDebouncedValue';
import useFetch from '@/hooks/useFetch';
import { roomService } from '@/services/roomService';

const MenuOptionsContainer = styled.div`
	display: flex;
	gap: 10px;
	justify-content: flex-start;
	margin-top: 20px;
	overflow: hidden;
	overflow-x: auto;
	padding-bottom: 15px;
`;

const MiddleMenu = () => {
	const { rooms, getRooms, setRooms } = useContext(RoomsContext);
	const [displayData, setDisplayData] = useState([]);
	const [displayFilter, setDisplayFilter] = useState('all');
	const [displayTitle, setDisplayTitle] = useState('Salas Disponibles');
	const [searchbarvalue, setSearchbarValue] = useState(undefined);
	const [scheduledDeactivations, setScheduledDeactivations] = useState([]);
	const debouncedSearchTerm = useDebounce(searchbarvalue);
	const { fetchAPICall } = useFetch();

	// Obtener salas programadas para desactivación
	const fetchScheduledDeactivations = async () => {
		try {
			const apiConfig = await roomService.getScheduledDeactivations();
			const response = await fetchAPICall(
				apiConfig.url,
				apiConfig.method,
				undefined,
				false
			);
			console.log('Scheduled deactivations response:', response);

			// La respuesta puede venir en diferentes formatos
			const data = response?.result || response?.data || response || {};
			console.log('Scheduled deactivations data:', data);

			// La respuesta viene con estructura { count: number, rooms: Array }
			const scheduledRooms = data.rooms || [];
			setScheduledDeactivations(scheduledRooms);
		} catch (error) {
			console.error('Error fetching scheduled deactivations:', error);
			setScheduledDeactivations([]);
		}
	};

	useEffect(() => {
		// Obtener desactivaciones programadas cuando se monta el componente
		fetchScheduledDeactivations();
	}, []);

	useEffect(() => {
		if (displayFilter === 'all') {
			setDisplayData(() => rooms.filter((room) => room.status !== 'archive'));
		} else if (displayFilter === 'scheduled') {
			// Los datos de scheduledDeactivations ya son objetos de sala completos
			console.log('Scheduled rooms from API:', scheduledDeactivations);

			// Extraer los room_ids de las salas programadas
			const scheduledRoomIds = scheduledDeactivations.map(
				(room) => room.room_id
			);
			console.log('Scheduled room IDs:', scheduledRoomIds);

			// Filtrar las salas del contexto que están programadas para desactivación
			const filteredRooms = rooms.filter((room) =>
				scheduledRoomIds.includes(room.room_id)
			);
			console.log('Filtered rooms:', filteredRooms);

			setDisplayData(filteredRooms);
		} else {
			setDisplayData(() =>
				rooms.filter((room) => room.status === displayFilter)
			);
		}
	}, [displayFilter, rooms, scheduledDeactivations]);

	useEffect(() => {
		if (debouncedSearchTerm !== undefined) {
			fetchAPICall(
				'/bingo/rooms',
				'get',
				{ value: debouncedSearchTerm },
				true
			).then((data) => {
				console.log(data);

				setRooms(data.result.reverse());
			});
		}
	}, [debouncedSearchTerm]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '35vw',
				height: '100%',
				borderRight: '2px solid',
				borderColor: theme.dark.borders.primary,
				padding: '10px 20px',
			}}
		>
			<SearchBar onChange={(e) => setSearchbarValue(e.target.value)} />
			<MenuOptionsContainer>
				<MenuOption
					title='Crear Salas'
					icoUrl={addIcon}
					path='/dashboard/roomForm'
				/>
				<MenuOption
					title='Salas Disponibles'
					icoUrl={boltIcon}
					onClick={() => {
						setDisplayFilter('all');
						setDisplayTitle('Salas Disponibles');
					}}
				/>
				<MenuOption
					title='Programadas'
					icoUrl={settingsIcon}
					onClick={() => {
						setDisplayFilter('scheduled');
						setDisplayTitle('Salas Programadas para Desactivación');
						fetchScheduledDeactivations(); // Actualizar lista
					}}
				/>
				<MenuOption
					title='Archivero De Salas'
					icoUrl={archiveStorageIcon}
					onClick={() => {
						setDisplayFilter('archive');
						setDisplayTitle('Archivero De Salas');
					}}
				/>
				<MenuOption
					title='Historial'
					icoUrl={boltIcon}
					path='/dashboard/historyLog'
				/>
			</MenuOptionsContainer>
			<Separator width={100} />
			<div
				style={{
					flex: 1,
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
					overflowY: 'auto',
				}}
			>
				<SubHeaderBar
					icon={refreshIcon}
					size={20}
					onClick={() => getRooms(true)}
				>
					Lista - {displayTitle}
				</SubHeaderBar>
				<Separator width={100} color={theme.dark.borders.secundary} />

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '10px',
						flex: 1,
						padding: '5px 0',
						paddingRight: '10px',
						height: '100%',
						overflowY: 'auto',
					}}
				>
					{displayData.length > 0 ? (
						displayData.map((room, key) => {
							// Verificar si esta sala está programada para desactivación
							const isScheduled = scheduledDeactivations.some(
								(scheduled) => scheduled.room_id === room.room_id
							);
							return (
								<SalaMenuCardEnhanced
									data={room}
									key={key}
									isScheduledForDeactivation={isScheduled}
								/>
							);
						})
					) : (
						<NoInfoComp content='No hay Salas disponibles' />
					)}
				</div>
			</div>
		</div>
	);
};

export default MiddleMenu;
