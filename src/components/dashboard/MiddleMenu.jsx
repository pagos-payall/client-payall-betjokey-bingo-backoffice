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

	// Log when rooms change
	useEffect(() => {
		console.log(
			'🏠 [MiddleMenu] Rooms updated from context:',
			rooms.length,
			'rooms'
		);
		if (rooms.length > 0) {
			console.log(rooms[1]);

			console.log(
				'  - First 3 rooms:',
				rooms
					.slice(0, 3)
					.map((r) => ({ id: r.room_id, name: r.room_name, status: r.status }))
			);
		}
	}, [rooms]);

	// Obtener salas programadas para desactivación
	const fetchScheduledDeactivations = async () => {
		console.log('🕑 [MiddleMenu] Fetching scheduled deactivations...');
		try {
			const apiConfig = await roomService.getScheduledDeactivations();
			const response = await fetchAPICall(
				apiConfig.url,
				apiConfig.method,
				undefined,
				false
			);
			// La respuesta puede venir en diferentes formatos
			const data = response?.result || response?.data || response || {};

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
		console.log(
			'🎮 [MiddleMenu] Component mounted, fetching scheduled deactivations'
		);
		fetchScheduledDeactivations();
	}, []);

	// Refrescar desactivaciones programadas cuando el filtro es 'scheduled'
	useEffect(() => {
		if (displayFilter === 'scheduled') {
			fetchScheduledDeactivations();
		}
	}, [displayFilter]);

	useEffect(() => {
		console.log('📋 [MiddleMenu] useEffect triggered');
		console.log('  - Display Filter:', displayFilter);
		console.log('  - Rooms count:', rooms.length);
		console.log(
			'  - Room statuses:',
			rooms.map((r) => `${r.room_id}:${r.status}`).join(', ')
		);

		if (displayFilter === 'all') {
			const filtered = rooms.filter((room) => room.status !== 'archive');
			console.log('  - Showing all non-archived rooms:', filtered.length);
			setDisplayData(filtered);
		} else if (displayFilter === 'scheduled') {
			// Los datos de scheduledDeactivations ya son objetos de sala completos

			// Extraer los room_ids de las salas programadas
			const scheduledRoomIds = scheduledDeactivations.map(
				(room) => room.room_id
			);

			// Filtrar las salas del contexto que están programadas para desactivación
			const filteredRooms = rooms.filter((room) =>
				scheduledRoomIds.includes(room.room_id)
			);

			console.log('  - Scheduled rooms filtered:', filteredRooms.length);
			setDisplayData(filteredRooms);
		} else {
			const filtered = rooms.filter((room) => room.status === displayFilter);
			console.log(
				`  - Filtered by status '${displayFilter}':`,
				filtered.length
			);
			setDisplayData(filtered);
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
				setRooms(data.result.reverse());
			});
		}
	}, [debouncedSearchTerm, fetchAPICall, setRooms]);

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
					onClick={() => {
						getRooms(true);
						fetchScheduledDeactivations();
					}}
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
					{rooms.length === 0 ? (
						<div
							style={{ textAlign: 'center', padding: '20px', color: '#999' }}
						>
							No hay salas disponibles
						</div>
					) : displayData.length > 0 ? (
						displayData.map((room, key) => {
							// Verificar si esta sala está programada para desactivación
							// Puede estar en la lista de scheduled o tener el flag enabled
							const isScheduled =
								room.scheduled_deactivation?.enabled ||
								scheduledDeactivations.some(
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
