import { useRouter, usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import RoomsContext from '@/context/rooms/RoomsContext';
import useUser from '@/hooks/useUser';
import useFetch from '@/hooks/useFetch';
import StatusLight from './StatusLight';
import RoomStatusBadge from './RoomStatusBadge';
import RoomActionButtons from './RoomActionButtons';
import SmartConfirmModal from './modals/SmartConfirmModal';
import DeactivationModal from './modals/DeactivationModal';
import { getActionRestriction } from '@/utils/errorHandler';
import { roomService } from '@/services/roomService';

const UpdateFormHeaderEnhanced = ({
	name,
	codigo,
	$status,
	rol,
	setUpdateMode,
	updateMode,
	room, // Full room object with game info
	onRoomUpdate,
}) => {
	const { getRooms, getUsers } = useContext(RoomsContext);
	const { username, hasPermission } = useUser();
	const { fetchAPICall } = useFetch();
	const router = useRouter();
	const path = usePathname();
	const user_or_room = path.includes('user');
	const baseUrl = '/backOffice';
	const fetchMethod = 'patch';

	const [confirmModal, setConfirmModal] = useState(false);
	const [deactivationModal, setDeactivationModal] = useState(false);
	const [modalContent, setModalContent] = useState({
		type: '',
		title: '',
		subtitle: '',
		confirmText: 'Aceptar',
		cancelText: 'Cancelar',
	});

	const handleAction = async (operation, reason = '') => {
		try {
			let apiConfig;

			// Handle different operations with roomService
			switch (operation) {
				case 'archive':
					apiConfig = await roomService.archiveRoom(codigo, username, reason);
					break;

				case 'unarchive':
					apiConfig = await roomService.unarchiveRoom(codigo, username, reason);
					break;

				case 'deactivate':
					apiConfig = await roomService.scheduleDeactivation(codigo, username, {
						reason,
					});
					break;

				case 'activate':
					apiConfig = await roomService.updateRoomState(
						codigo,
						'active',
						reason
					);
					break;

				case 'delete':
					apiConfig = await roomService.deleteRoom(codigo, username, reason);
					break;

				case 'cancelDeactivation':
					apiConfig = await roomService.cancelScheduledDeactivation(codigo, username);
					break;

				default:
					// For user operations, use original logic
					if (path.includes('user')) {
						apiConfig = {
							url: baseUrl,
							method: fetchMethod,
							data: {
								username: name,
								operatorName: username,
								operation,
								...(reason && { reason }),
							},
						};
					}
					break;
			}

			if (apiConfig) {
				await fetchAPICall(apiConfig.url, apiConfig.method, apiConfig.data);
			}

			// Success - refresh data and redirect
			if (!path.includes('user')) {
				getRooms();
				// Show success message for cancel deactivation
				if (operation === 'cancelDeactivation') {
					toast.success('Desactivación programada cancelada exitosamente');
					if (onRoomUpdate) {
						onRoomUpdate();
					}
				}
				router.push('/dashboard');
			} else {
				getUsers();
				router.push('/usersManagerView/historyLog');
			}
		} catch (error) {
			// Error is already handled by useFetch and error handler
			console.error('Action failed:', error);
		}
	};

	const handleActionClick = (action, room) => {
		let modalConfig = {
			type: action,
			cancelText: 'Cancelar',
		};

		switch (action) {
			case 'delete':
				modalConfig.title = `¿Estás seguro que deseas borrar ${
					user_or_room ? 'el usuario' : 'la sala'
				}?`;
				modalConfig.subtitle = `¡Una vez borrad${
					user_or_room ? 'o' : 'a'
				} no podrás recuperarl${user_or_room ? 'o' : 'a'}!`;
				modalConfig.confirmText = 'Borrar';
				break;

			case 'unarchive':
				modalConfig.title = `¿Estás seguro que deseas desarchivar ${
					user_or_room ? 'el usuario' : 'la sala'
				}?`;
				modalConfig.confirmText = 'Desarchivar';
				break;

			case 'edit':
				handleSetUpdate();
				return; // Don't show modal for edit

			case 'activate':
				modalConfig.title = `¿Estás seguro que deseas activar ${
					user_or_room ? 'el usuario' : 'la sala'
				}?`;
				modalConfig.confirmText = 'Activar';
				break;

			case 'deactivate':
				// Si es una sala, usar el nuevo modal de desactivación
				if (!user_or_room) {
					setDeactivationModal(true);
					return;
				}
				// Para usuarios, usar el modal normal
				modalConfig.title = '¿Estás seguro que deseas desactivar el usuario?';
				modalConfig.confirmText = 'Desactivar';
				break;

			case 'cancelDeactivation':
				modalConfig.title = '¿Estás seguro que deseas cancelar la desactivación programada?';
				modalConfig.subtitle = 'La sala volverá a su estado normal y no se desactivará automáticamente.';
				modalConfig.confirmText = 'Cancelar Desactivación';
				break;
		}

		setModalContent(modalConfig);
		setConfirmModal(true);
	};

	const handleSetUpdate = () => {
		// Check if it's a room and if editing is restricted
		if (!user_or_room) {
			const editRestriction = getActionRestriction(room, 'edit');
			if (editRestriction.disabled) {
				toast.error(editRestriction.reason);
				return;
			}
		}

		setUpdateMode((value) => !value);
		toast.info(
			updateMode ? 'Modo de edición desactivado' : 'Modo de edición activo'
		);
	};

	const handleModalConfirm = (result) => {
		if (result.confirmed) {
			handleAction(result.type, result.reason);
		}
	};

	const handleDeactivationConfirm = async (data) => {
		try {
			const apiConfig = await roomService.scheduleDeactivation(codigo, username, {
				reason: data.reason,
				immediate_deactivation: data.immediate_deactivation
			});


			await fetchAPICall(apiConfig.url, apiConfig.method, apiConfig.data);
			
			// Mostrar mensaje de éxito según el tipo
			if (data.immediate_deactivation) {
				toast.success('La sala está siendo desactivada inmediatamente');
			} else {
				toast.info('La sala fue programada para desactivación al culminar la próxima partida');
			}

			// Refrescar datos y redirigir
			getRooms();
			if (onRoomUpdate) {
				onRoomUpdate();
			}
			router.push('/dashboard');
		} catch (error) {
			console.error('Error al programar desactivación:', error);
		}
	};

	// Permissions for action buttons
	const permissions = {
		delete: hasPermission('delete', user_or_room ? 'users' : 'rooms'),
		archive: hasPermission('archive', user_or_room ? 'users' : 'rooms'), // Permitir desarchivar
		edit: hasPermission('edit', user_or_room ? 'users' : 'rooms'),
		toggle: hasPermission('edit', user_or_room ? 'users' : 'rooms'),
	};

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '16px',
				padding: '8px 0',
				flexWrap: 'wrap',
			}}
		>
			{confirmModal && (
				<SmartConfirmModal
					modalContent={modalContent}
					closeModal={() => setConfirmModal(false)}
					onConfirm={handleModalConfirm}
					showReasonInput={!user_or_room} // Show reason input for rooms
					reasonRequired={false} // Reason is optional
					room={room} // Pass room data for warnings
				/>
			)}

			{deactivationModal && (
				<DeactivationModal
					isOpen={deactivationModal}
					onClose={() => setDeactivationModal(false)}
					room={room}
					onConfirm={handleDeactivationConfirm}
				/>
			)}

			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<span style={{ fontSize: '18px', fontWeight: 'bold' }}>
					{name + (codigo ? ' - ' + codigo : '')}
				</span>

				{/* Show enhanced status badge for rooms */}
				{!user_or_room && room ? (
					<RoomStatusBadge room={room} />
				) : (
					<StatusLight $status={$status} size={12.5} />
				)}
			</div>

			{/* Use smart action buttons for rooms */}
			{!user_or_room && room ? (
				<RoomActionButtons
					room={room}
					onAction={handleActionClick}
					permissions={permissions}
				/>
			) : (
				// Original buttons for users (simplified)
				hasPermission('delete', 'users') &&
				rol !== 'admin' && (
					<RoomActionButtons
						room={{ status: $status }}
						onAction={handleActionClick}
						permissions={permissions}
					/>
				)
			)}
		</div>
	);
};

export default UpdateFormHeaderEnhanced;
