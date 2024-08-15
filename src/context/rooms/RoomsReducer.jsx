import { GET_USERS } from '../users/types';
import UsersContext from '../users/UsersContext';
import { GET_ROOMS } from './types';

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
	}
};

export default RoomsReducer;
