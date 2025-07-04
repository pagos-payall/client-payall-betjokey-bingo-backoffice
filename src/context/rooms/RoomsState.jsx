'use client';
import { useReducer, useCallback, useEffect } from 'react';
import RoomsContext from './RoomsContext';
import RoomsReducer from './RoomsReducer';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { useWebSocketContext } from '@/components/WebSocketProvider';

const RoomsState = ({ children }) => {
	const { fetchAPICall } = useFetch();
	const { level } = useUser();
	const websocket = useWebSocketContext();
	const initialState = {
		rooms: [],
		users: [],
	};
	const [state, dispatch] = useReducer(RoomsReducer, initialState);

	const getRooms = useCallback(async (notification) => {
		console.log('🏠 [RoomsState] getRooms called, notification:', notification);
		let response;
		let boolean = notification ? notification : false;

		try {
			console.log('  - Fetching rooms from API...');
			const data = await fetchAPICall(
				'/bingo/rooms',
				'get',
				undefined,
				boolean
			);
			response = data?.result ? data.result.reverse() : [];
			console.log('  - Rooms fetched:', response.length, 'rooms');
			
		} catch (error) {
			console.error('  - Error fetching rooms:', error);
			response = [];
		}

		console.log('  - Dispatching GET_ROOMS with', response.length, 'rooms');
		dispatch({
			type: 'GET_ROOMS',
			payload: response,
		});
	}, [fetchAPICall]);

	const getUsers = useCallback(async (notification) => {
		let response;
		let boolean = notification ? notification : false;

		try {
			response = await fetchAPICall(
				'/backOffice',
				'get',
				undefined,
				boolean
			).then((data) => data.result.reverse());

			if (level !== 'admin')
				response = response.filter((user) => user.role !== 'admin');
		} catch (error) {
			response = [];
		}

		dispatch({
			type: 'GET_USERS',
			payload: response,
		});
	}, [fetchAPICall, level]);

	const setRooms = useCallback((data) => {
		dispatch({
			type: 'GET_ROOMS',
			payload: data,
		});
	}, []);

	const setUsers = useCallback((data) => {
		dispatch({
			type: 'GET_USERS',
			payload: data,
		});
	}, []);


	// Escuchar eventos WebSocket para actualizar automáticamente (mantener como respaldo)
	useEffect(() => {
		console.log('🔌 [RoomsState] WebSocket effect triggered');
		console.log('  - Connected:', websocket.connected);
		console.log('  - Last Update:', websocket.lastUpdate);
		
		if (!websocket.connected || !websocket.lastUpdate) {
			console.log('  - WebSocket not connected or no update, skipping');
			return;
		}

		// Evitar procesar eventos duplicados basándose en timestamp
		if (websocket.lastUpdate.timestamp && websocket.lastUpdate.timestamp <= (window.lastRoomsUpdateTimestamp || 0)) {
			console.log('  - Duplicate event ignored, timestamp:', websocket.lastUpdate.timestamp);
			return;
		}
		
		// Marcar este timestamp como procesado
		window.lastRoomsUpdateTimestamp = websocket.lastUpdate.timestamp;

		// Handler para cuando el WebSocket nos envía actualizaciones
		const handleWebSocketUpdate = (update) => {
			console.log('🔄 [RoomsState] handleWebSocketUpdate called:', update);
			if (!update) {
				console.log('  - No update data, returning');
				return;
			}

			switch (update.type) {
				case 'room:status:changed':
				case 'room:activated':
				case 'room:deactivated':
				case 'room:archived':
				case 'rooms:list:updated':
					// Refrescar lista de salas cuando hay cambios
					console.log('✅ [RoomsState] Room update detected:', update.type);
					console.log('  - Update data:', update.data);
					console.log('  - Calling getRooms(true)...');
					getRooms(true); // true indica que es una notificación
					break;
				
				case 'game:state:updated':
					// También refrescar en cambios de juego
					console.log('🎮 [RoomsState] Game update detected:', update.type);
					console.log('  - Calling getRooms(true)...');
					getRooms(true);
					break;
				
				default:
					console.log('⚠️ [RoomsState] Unhandled update type:', update.type);
			}
		};

		// Revisar si hay una actualización pendiente
		if (websocket.lastUpdate) {
			console.log('📨 [RoomsState] Processing pending update');
			handleWebSocketUpdate(websocket.lastUpdate);
		}

		// Variable para rastrear la última actualización procesada
		let lastProcessedTimestamp = websocket.lastUpdate?.timestamp || 0;

		// Intervalo para verificar actualizaciones
		const checkInterval = setInterval(() => {
			if (websocket.lastUpdate && 
				websocket.lastUpdate.timestamp > lastProcessedTimestamp) {
				console.log('🆕 [RoomsState] New update detected in interval');
				handleWebSocketUpdate(websocket.lastUpdate);
				lastProcessedTimestamp = websocket.lastUpdate.timestamp;
			}
		}, 500);

		return () => {
			console.log('🚫 [RoomsState] Cleaning up WebSocket effect');
			clearInterval(checkInterval);
		};
	}, [websocket.connected, websocket.lastUpdate, getRooms]);

	return (
		<RoomsContext.Provider
			value={{
				rooms: state.rooms,
				users: state.users,
				getRooms,
				getUsers,
				setRooms,
				setUsers,
			}}
		>
			{children}
		</RoomsContext.Provider>
	);
};

export default RoomsState;
