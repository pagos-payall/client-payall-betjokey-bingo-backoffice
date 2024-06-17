import { GET_ROOMS } from './types';

const RoomsReducer = (state, action) => {
	const { payload, type } = action;

	switch (type) {
		case GET_ROOMS:
			return {
				...state,
				rooms: payload,
			};
	}
};

export default RoomsReducer;
