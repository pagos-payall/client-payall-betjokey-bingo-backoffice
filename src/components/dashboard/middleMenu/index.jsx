'use client';
import styled from 'styled-components';
import { theme } from '../../../data/themes';
import SearchBar from '../../SearchBar';
import MenuOption from '../../MenuOption';
import Separator from '../../Separator';
import SalaMenuCard from '../../SalaMenuCard';
import {
	addIcon,
	archiveStorageIcon,
	boltIcon,
	refreshIcon,
} from '@/data/icons';
import RoomsContext from '@/context/rooms/RoomsContext';
import { useContext, useEffect, useState } from 'react';
import NoInfoComp from '../../NoInfoComp';
import SubHeaderBar from '../../SubHeaderBar';

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
	const { rooms, getRooms } = useContext(RoomsContext);
	const [displayData, setDisplayData] = useState([]);
	const [displayFilter, setDisplayFilter] = useState('all');

	useEffect(() => {
		displayFilter === 'all'
			? setDisplayData(() => rooms.filter((room) => room.status !== 'archive'))
			: setDisplayData(() =>
					rooms.filter((room) => room.status === displayFilter)
			  );
	}, [displayFilter, rooms]);

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
			<SearchBar />
			<MenuOptionsContainer>
				<MenuOption
					title='Crear Salas'
					icoUrl={addIcon}
					path='/dashboard/roomForm'
				/>
				<MenuOption
					title='Salas Disponibles'
					icoUrl={boltIcon}
					onClick={() => setDisplayFilter('all')}
				/>
				<MenuOption
					title='Archivero De Salas'
					icoUrl={archiveStorageIcon}
					onClick={() => setDisplayFilter('archive')}
				/>
				<MenuOption
					title='Historial'
					icoUrl={boltIcon}
					path='/dashboard/historyLogs'
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
					Lista de Salas
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
						displayData.map((room, key) => (
							<SalaMenuCard data={room} key={key} />
						))
					) : (
						<NoInfoComp content='No hay Salas disponibles' />
					)}
				</div>
			</div>
		</div>
	);
};

export default MiddleMenu;
