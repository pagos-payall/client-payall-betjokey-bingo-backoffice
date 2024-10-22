import { useRouter, usePathname } from 'next/navigation'
import { useContext, useState } from 'react'
import StatusLight from './StatusLight'
import { IconComponent } from './SubHeaderBar'
import { toast } from 'react-toastify'
import RoomsContext from '@/context/rooms/RoomsContext'
import {
	deleteIcon,
	editIcon,
	archiveIcon,
	unarchiveIcon,
	toggle_on,
	toggle_off,
} from '@/data/icons'
import useUser from '@/hooks/useUser'
import useFetch from '@/hooks/useFetch'
import AlertConfirmModal from './modals/AlertConfirmModal'

const UpdateFormHeader = ({
	name,
	codigo,
	status,
	rol,
	setUpdateMode,
	updateMode,
}) => {
	const { getRooms, getUsers } = useContext(RoomsContext)
	const { username } = useUser()
	const { fetchAPICall } = useFetch()
	const router = useRouter()
	const path = usePathname()
	const user_or_room = path.includes('user')
	const url = user_or_room ? '/backOffice' : 'bingo/rooms'
	const fetchMethod = user_or_room ? 'patch' : 'put'
	const modalTitleB = `¿Estás seguro de que deseas borrar ${
		user_or_room ? 'el usuario' : 'la sala'
	}?`
	const modalSubtitleB = `¡Una vez borrad${
		user_or_room ? 'o' : 'a'
	} no podrás recuperarl${user_or_room ? 'o' : 'a'}!`

	const modalTitleA = `¿Estás seguro de que deseas ${
		status !== 'archive' ? 'archivar' : 'desarchivar'
	} ${user_or_room ? 'el usuario' : 'la sala'}?`

	const [confirmModal, setConfirmModal] = useState(false)
	const [modalContent, setModelContent] = useState({
		onConfirm: () => {},
		title: '',
		subtitle: '',
		confirmText: 'Aceptar',
		cancelText: 'Cancelar',
	})

	const handleSetUpdate = () => {
		if (user_or_room === false && status === 'active')
			toast('La sala esta activa sus datos no pueden ser editados')
		setUpdateMode((value) => {
			return !value
		})

		if (updateMode) toast('Modo de edicion desactivado')
		else toast('Modo de edicion activo')
	}

	const handleAction = (operation) => {
		if (status === 'archive') operation = 'unarchive'

		const values = {
			operatorName: username,
			operation,
		}

		path.includes('user')
			? (values['username'] = name)
			: (values['room_id'] = codigo)

		const method = fetchMethod
		const thenFunction = () => {
			if (!path.includes('user')) {
				getRooms()
				router.push('/dashboard/historyLog')
			} else {
				getUsers()
				router.push('/usersManagerView/historyLog')
			}
		}

		fetchAPICall(url, method, values).then(thenFunction)
	}

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
			}}
		>
			{confirmModal && (
				<AlertConfirmModal
					modalContent={modalContent}
					closeModal={() => setConfirmModal(false)}
				/>
			)}

			{name + (codigo ? ' - ' + codigo : '')}
			<StatusLight status={status} size={12.5} />
			{rol !== 'admin' && (
				<>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<IconComponent
							url={deleteIcon}
							size={20}
							onClick={() => {
								setConfirmModal(true)
								setModelContent(() => ({
									method: () => handleAction('delete'),
									title: modalTitleB,
									subtitle: modalSubtitleB,
									confirmText: 'Borrar',
								}))
							}}
						/>
						<p>Borrar</p>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<IconComponent
							url={status !== 'archive' ? archiveIcon : unarchiveIcon}
							size={20}
							onClick={() => {
								setConfirmModal(true)
								setModelContent(() => ({
									method: () => handleAction('archive'),
									title: modalTitleA,
								}))
							}}
						/>
						<p>{status !== 'archive' ? 'Archivar' : 'Desarchivar'}</p>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<IconComponent url={editIcon} size={20} onClick={handleSetUpdate} />
						<p>{updateMode ? 'Desactivar edición' : 'Editar'}</p>
					</div>
					{(status === 'disable' || status === 'active') && (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<IconComponent
								url={status === 'disable' ? toggle_on : toggle_off}
								size={20}
								onClick={() =>
									handleAction(status === 'disable' ? 'active' : 'disable')
								}
								color={status === 'disable' ? 'green' : 'red'}
							/>
							<p>{status === 'disable' ? 'Activar' : 'Desactivar'}</p>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default UpdateFormHeader
