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
import { useDebounce } from '@/services/useDebouncedValue'
import useFetch from '@/hooks/useFetch'
import useUser from '@/hooks/useUser'

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
	const { users, getUsers, setUsers } = useContext(RoomsContext)
	const { username, level } = useUser()
	const [displayData, setDisplayData] = useState([])
	const [displayFilter, setDisplayFilter] = useState('all')
	const [displayTitle, setDisplayTitle] = useState('Usuarios Activos')
	const [searchbarvalue, setSearchbarValue] = useState(undefined)
	const debouncedSearchTerm = useDebounce(searchbarvalue)
	const { fetchAPICall } = useFetch()

	useEffect(() => {
		displayFilter === 'all'
			? setDisplayData(() =>
					users.filter(
						(users) => users.status !== 'archive' && users.username !== username
					)
			  )
			: setDisplayData(() =>
					users.filter(
						(users) =>
							users.status === displayFilter && users.username !== username
					)
			  )
	}, [displayFilter, users])

	useEffect(() => {
		if (debouncedSearchTerm !== undefined) {
			fetchAPICall(
				'/backOffice',
				'get',
				{ searchBar: debouncedSearchTerm },
				true
			).then((data) => setUsers(data.result.reverse()))
		}
	}, [debouncedSearchTerm])

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
					title='Crear Usuario'
					icoUrl={addIcon}
					path='/usersManagerView/userForm'
				/>
				<MenuOption
					title='Usuarios Activos y innactivos'
					icoUrl={boltIcon}
					onClick={() => {
						setDisplayFilter('all')
						setDisplayTitle('Usuarios Activos')
					}}
				/>
				<MenuOption
					title='Archivero De Usuarios'
					icoUrl={archiveStorageIcon}
					onClick={() => {
						setDisplayFilter('archive')
						setDisplayTitle('Archivero De Usuarios')
					}}
				/>
				<MenuOption
					title='Historial'
					icoUrl={boltIcon}
					path='/usersManagerView/historyLog'
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
