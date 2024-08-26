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
	const url = path.includes('user') ? '/backOffice' : 'bingo/rooms'
	const fetchMethod = path.includes('user') ? 'patch' : 'put'
	const [deleteModal, setDeleteModal] = useState(false)

	const handleSetUpdate = () => {
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
			{deleteModal && (
				<AlertConfirmModal
					closeModal={() => setDeleteModal(false)}
					method={() => handleAction('delete')}
				/>
			)}

			{name + (codigo ? ' - ' + codigo : '')}
			<StatusLight status={status} size={12.5} />
			{rol !== 'admin' && (
				<>
					<IconComponent
						url={deleteIcon}
						size={20}
						onClick={() => setDeleteModal(true)}
					/>
					<IconComponent
						url={status !== 'archive' ? archiveIcon : unarchiveIcon}
						size={20}
						onClick={() => handleAction('archive')}
					/>
					<IconComponent url={editIcon} size={20} onClick={handleSetUpdate} />
					{status === 'disable' && (
						<IconComponent
							url={toggle_on}
							size={20}
							onClick={() => handleAction('active')}
							color={'green'}
						/>
					)}
					{status === 'active' && (
						<IconComponent
							url={toggle_off}
							size={20}
							onClick={() => handleAction('disable')}
							color={'red'}
						/>
					)}
				</>
			)}
		</div>
	)
}

export default UpdateFormHeader
