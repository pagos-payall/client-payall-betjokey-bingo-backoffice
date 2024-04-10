import { deleteIcon, editIcon, archiveIcon, unarchiveIcon } from '@/data/icons';
import StatusLight from './StatusLight';
import { IconComponent } from './SubHeaderBar';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import fetchAPICall from '@/services/fetchAPICall';
import RoomsContext from '@/context/RoomsContext';
import { useRouter } from 'next/navigation';
import sweetAlert_confirm from './SweetAlert_confirm';

const UpdateFormHeader = ({
	name,
	codigo,
	status,
	setUpdateMode,
	updateMode,
}) => {
	const { username, getRooms } = useContext(RoomsContext);
	const router = useRouter();
	const handleSetUpdate = () => {
		setUpdateMode((value) => {
			return !value;
		});

		if (updateMode) toast('Modo de edicion desactivado');
		else toast('Modo de edicion activo');
	};

	const handleAction = (operation) => {
		if (status === 'archive') operation = 'unarchive';

		const values = {
			username: username,
			room_id: codigo,
			operation: operation,
		};
		const method = operation === 'delete' ? 'delete' : 'put';

		console.log(method);

		const funct = () =>
			fetchAPICall('bingo/rooms', method, values).then(() => {
				getRooms();
				router.push('/dashboard');
			});

		if (operation === 'delete') {
			const deleteConfirmationConfig = {
				title: 'Estas seguro de que deseas borrar la sala?',
				subtitle: 'Una vez borrada no podras recuperarla!',
				cancelConfig: {
					title: 'Cancelado',
					subtitle: 'La sala no fue borrada',
				},
			};

			sweetAlert_confirm(funct, deleteConfirmationConfig);
		} else {
			console.log(values);
			funct();
		}
	};

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
			}}
		>
			{name + ' - ' + codigo}
			<StatusLight status={status} size={12.5} />
			<IconComponent
				url={deleteIcon}
				size={20}
				onClick={() => handleAction('delete')}
			/>
			<IconComponent url={editIcon} size={20} onClick={handleSetUpdate} />
			<IconComponent
				url={status !== 'archive' ? archiveIcon : unarchiveIcon}
				size={20}
				onClick={() => handleAction('archive')}
			/>
		</div>
	);
};

export default UpdateFormHeader;
