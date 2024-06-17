import { GET_USERS, SET_ACT_USERNAME } from './types';

const UsersReducer = (state, action) => {
	const { payload, type } = action;

	switch (type) {
		case GET_USERS:
			return {
				...state,
				users: payload,
			};
		case SET_ACT_USERNAME:
			return {
				...state,
				username: payload.username,
				jwt: payload.jwt,
			};
	}
};

export default UsersReducer;
