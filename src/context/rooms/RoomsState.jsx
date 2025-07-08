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
		let response;
		let boolean = notification ? notification : false;

		try {
			const data = await fetchAPICall(
				'/bingo/rooms',
				'get',
				undefined,
				boolean
			);
			response = data?.result ? data.result.reverse() : [];
			
		} catch (error) {
			response = [];
		}

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
		
		if (!websocket.connected || !websocket.lastUpdate) {
			return;
		}

		// Evitar procesar eventos duplicados basándose en timestamp
		if (websocket.lastUpdate.timestamp && websocket.lastUpdate.timestamp <= (window.lastRoomsUpdateTimestamp || 0)) {
			return;
		}
		
		// Marcar este timestamp como procesado
		window.lastRoomsUpdateTimestamp = websocket.lastUpdate.timestamp;

		// Handler para cuando el WebSocket nos envía actualizaciones
		const handleWebSocketUpdate = (update) => {
			if (!update) {
				return;
			}

			switch (update.type) {
				case 'room:status:changed':
				case 'room:activated':
				case 'room:deactivated':
				case 'room:archived':
				case 'rooms:list:updated':
					// Refrescar lista de salas cuando hay cambios
					getRooms(true); // true indica que es una notificación
					break;
				
				case 'game:state:updated':
				case 'cards:sold:updated':
					// También refrescar en cambios de juego o venta de cartones
					getRooms(true);
					break;
					
				case 'rooms:list:full':
					// Lista completa de salas recibida del WebSocket
					if (update.data.rooms) {
						dispatch({
							type: 'GET_ROOMS',
							payload: update.data.rooms
						});
					}
					break;
				
				default:
			}
		};

		// Revisar si hay una actualización pendiente
		if (websocket.lastUpdate) {
			handleWebSocketUpdate(websocket.lastUpdate);
		}

		// Variable para rastrear la última actualización procesada
		let lastProcessedTimestamp = websocket.lastUpdate?.timestamp || 0;

		// Intervalo para verificar actualizaciones
		const checkInterval = setInterval(() => {
			if (websocket.lastUpdate && 
				websocket.lastUpdate.timestamp > lastProcessedTimestamp) {
				handleWebSocketUpdate(websocket.lastUpdate);
				lastProcessedTimestamp = websocket.lastUpdate.timestamp;
			}
		}, 500);

		return () => {
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
