import { GET_ROOMS, SET_DISPLAY_VIEW } from './types';

const RoomsReducer = (state, action) => {
	const { payload, type } = action;

	switch (type) {
		case GET_ROOMS:
			return {
				...state,
				rooms: payload,
			};
		case SET_DISPLAY_VIEW:
			return {
				...state,
				display_view: payload,
			};
	}
};

export default RoomsReducer;
