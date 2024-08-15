import { useRouter, usePathname } from 'next/navigation'
import { useContext } from 'react'
import StatusLight from './StatusLight'
import { IconComponent } from './SubHeaderBar'
import { toast } from 'react-toastify'
import RoomsContext from '@/context/rooms/RoomsContext'
import sweetAlert_confirm from './SweetAlert_confirm'
import { deleteIcon, editIcon, archiveIcon, unarchiveIcon } from '@/data/icons'
import useUser from '@/hooks/useUser'
import useFetch from '@/hooks/useFetch'

const UpdateFormHeader = ({
	name,
	codigo,
	status,
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

		const method = operation === 'delete' ? 'delete' : fetchMethod
		const thenFunction = !path.includes('user')
			? () => {
					getRooms()
					router.push('/dashboard')
			  }
			: () => {
					getUsers()
					router.push('/usersManagerView/historyLog')
			  }

		const funct = () => fetchAPICall(url, method, values).then(thenFunction)

		if (operation === 'delete') {
			const deleteConfirmationConfig = {
				title: 'Estas seguro de que deseas borrar la sala?',
				subtitle: 'Una vez borrada no podras recuperarla!',
				cancelConfig: {
					title: 'Cancelado',
					subtitle: 'La sala no fue borrada',
				},
			}

			sweetAlert_confirm(funct, deleteConfirmationConfig)
		} else {
			funct()
		}
	}

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
			}}
		>
			{name + (codigo ? ' - ' + codigo : '')}
			<StatusLight status={status} size={12.5} />
			{!name.includes('admin') && (
				<>
					<IconComponent
						url={deleteIcon}
						size={20}
						onClick={() => handleAction('delete')}
					/>
					<IconComponent
						url={status !== 'archive' ? archiveIcon : unarchiveIcon}
						size={20}
						onClick={() => handleAction('archive')}
					/>
					<IconComponent url={editIcon} size={20} onClick={handleSetUpdate} />
				</>
			)}
		</div>
	)
}

export default UpdateFormHeader
