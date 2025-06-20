import { useRouter, usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import StatusLight from './StatusLight';
import { IconComponent } from './SubHeaderBar';
import { toast } from 'react-toastify';
import RoomsContext from '@/context/rooms/RoomsContext';
import {
	deleteIcon,
	editIcon,
	unarchiveIcon,
	toggle_on,
	toggle_off,
} from '@/data/icons';
import useUser from '@/hooks/useUser';
import useFetch from '@/hooks/useFetch';
import AlertConfirmModal from './modals/AlertConfirmModal';
import { roomService } from '@/services/roomService';

const UpdateFormHeader = ({
	name,
	codigo,
	$status,
	rol,
	setUpdateMode,
	updateMode,
	room,
}) => {
	const { getRooms, getUsers } = useContext(RoomsContext);
	const { username, hasPermission } = useUser();
	const { fetchAPICall } = useFetch();
	const router = useRouter();
	const path = usePathname();
	const user_or_room = path.includes('user');
	const url = '/backOffice';
	const fetchMethod = 'patch';
	const modalTitleB = `¿Estás seguro que deseas borrar ${
		user_or_room ? 'el usuario' : 'la sala'
	}?`;
	const modalSubtitleB = `¡Una vez borrad${
		user_or_room ? 'o' : 'a'
	} no podrás recuperarl${user_or_room ? 'o' : 'a'}!`;


	const [confirmModal, setConfirmModal] = useState(false);
	const [modalContent, setModelContent] = useState({
		type: '',
		title: '',
		subtitle: '',
		confirmText: 'Aceptar',
		cancelText: 'Cancelar',
	});
	const [func, setFunc] = useState(() => {});

	const handleSetUpdate = () => {
		// Para salas, validar que solo se pueda editar si está DISPONIBLE o ARCHIVADA
		if (!user_or_room) {
			// Solo permitir edición si está archivada o es active sin juego (DISPONIBLE)
			const canEdit = $status === 'archive' || ($status === 'active' && !room?.game);
			
			if (!canEdit) {
				toast.error('Solo se puede editar salas disponibles o archivadas');
				return;
			}
		}
		
		setUpdateMode((value) => {
			const newValue = !value;
			toast.info(newValue ? 'Modo de edición activo' : 'Modo de edición desactivado');
			return newValue;
		});
	};

	const handleAction = async (operation) => {
		try {
			let apiConfig;

			if (!path.includes('user')) {
				// Room operations using roomService
				switch (operation) {
					case 'archive':
						apiConfig = await roomService.archiveRoom(codigo, username);
						break;
					case 'unarchive':
						apiConfig = await roomService.unarchiveRoom(codigo, username);
						break;
					case 'disable':
						apiConfig = await roomService.scheduleDeactivation(codigo, username);
						break;
					case 'active':
						apiConfig = await roomService.updateRoomState(codigo, 'active');
						break;
					case 'delete':
						apiConfig = await roomService.deleteRoom(codigo, username);
						break;
					default:
						apiConfig = await roomService.legacyOperation(codigo, operation, username);
						break;
				}
				await fetchAPICall(apiConfig.url, apiConfig.method, apiConfig.data);
				getRooms();
				router.push('/dashboard');
			} else {
				// User operations
				const values = {
					operatorName: username,
					operation,
					username: name
				};
				await fetchAPICall(url, fetchMethod, values);
				getUsers();
				router.push('/usersManagerView/historyLog');
			}
		} catch (error) {
			console.error('Action failed:', error);
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
			{confirmModal && (
				<AlertConfirmModal
					modalContent={modalContent}
					closeModal={() => setConfirmModal(false)}
					method={handleAction}
				/>
			)}

			{name + (codigo ? ' - ' + codigo : '')}
			<StatusLight $status={$status} size={12.5} />
			{hasPermission('delete', user_or_room ? 'users' : 'rooms') && (
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
								setConfirmModal(true);
								setModelContent(() => ({
									type: 'delete',
									title: modalTitleB,
									subtitle: modalSubtitleB,
									confirmText: 'Borrar',
								}));
							}}
						/>
						<p>Borrar</p>
					</div>
					{$status === 'archive' && (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<IconComponent
								url={unarchiveIcon}
								size={20}
								onClick={() => {
									setConfirmModal(true);
									setModelContent(() => ({
										type: 'unarchive',
										title: '¿Estás seguro que deseas desarchivar la sala?',
										confirmText: 'Desarchivar',
									}));
								}}
							/>
							<p>Desarchivar</p>
						</div>
					)}
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
					{($status === 'disable' || $status === 'active' || $status === 'waiting' || $status === 'off') && (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<IconComponent
								url={$status === 'disable' ? toggle_on : toggle_off}
								size={20}
								onClick={() =>
									handleAction($status === 'disable' ? 'active' : 'disable')
								}
								color={$status === 'disable' ? 'green' : 'red'}
							/>
							<p>{$status === 'disable' ? 'Activar' : 'Desactivar'}</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default UpdateFormHeader;
