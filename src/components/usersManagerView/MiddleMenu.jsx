'use client'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme } from '../../data/themes'
import SearchBar from '../SearchBar'
import MenuOption from '../MenuOption'
import Separator from '../Separator'
import {
	addIcon,
	archiveStorageIcon,
	boltIcon,
	refreshIcon,
} from '@/data/icons'
import NoInfoComp from '../NoInfoComp'
import SubHeaderBar from '../SubHeaderBar'
import UserMenuCard from './UsersMenuCard'
import RoomsContext from '@/context/rooms/RoomsContext'

const MenuOptionsContainer = styled.div`
	display: flex;
	gap: 10px;
	justify-content: flex-start;
	margin-top: 20px;
	overflow: hidden;
	overflow-x: auto;
	padding-bottom: 15px;
`

const MiddleMenu = () => {
	const { users, getUsers } = useContext(RoomsContext)
	const [displayData, setDisplayData] = useState([])
	const [displayFilter, setDisplayFilter] = useState('all')

	useEffect(() => {
		displayFilter === 'all'
			? setDisplayData(() =>
					users.filter((users) => users.status !== 'archive')
			  )
			: setDisplayData(() =>
					users.filter((users) => users.status === displayFilter)
			  )
	}, [displayFilter, users])

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
					title='Crear Usuario'
					icoUrl={addIcon}
					path='/usersManagerView/userForm'
				/>
				<MenuOption
					title='Usuarios Activos'
					icoUrl={boltIcon}
					onClick={() => setDisplayFilter('all')}
				/>
				<MenuOption
					title='Archivero De Usuarios'
					icoUrl={archiveStorageIcon}
					onClick={() => setDisplayFilter('archive')}
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
					onClick={() => getUsers(true)}
				>
					Lista de Usuarios
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
						displayData.map((user, key) => (
							<UserMenuCard data={user} key={key} />
						))
					) : (
						<NoInfoComp content='No hay Usuarios disponibles' />
					)}
				</div>
			</div>
		</div>
	)
}

export default MiddleMenu
