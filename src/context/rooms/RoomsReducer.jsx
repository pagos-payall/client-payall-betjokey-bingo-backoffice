import { GET_USERS } from '../users/types';
import { GET_ROOMS, UPDATE_ROOM } from './types';

const RoomsReducer = (state, action) => {
	const { payload, type } = action;

	switch (type) {
		case GET_ROOMS:
			return {
				...state,
				rooms: payload,
			};
		case GET_USERS:
			return {
				...state,
				users: payload,
			};
		case UPDATE_ROOM:
			// Actualizar solo una sala específica
			const { roomId, updates } = payload;
			const updatedRooms = state.rooms.map(room => 
				room.room_id === roomId 
					? { ...room, ...updates }
					: room
			);
			return {
				...state,
				rooms: updatedRooms,
			};
		default:
			return state;
	}
};

export default RoomsReducer;
