import {
	GET_USERS,
	SET_ACT_USERNAME,
	SET_TOKEN_STATUS,
	SET_NEW_SESSION,
} from './types'

const UsersReducer = (state, action) => {
	const { payload, type } = action

	switch (type) {
		case GET_USERS:
			return {
				...state,
				users: payload,
			}
		case SET_ACT_USERNAME:
			return {
				...state,
				username: payload.username,
				level: payload.level,
			}
		case SET_TOKEN_STATUS:
			return {
				...state,
				token_status: payload.token_status,
			}
		case SET_NEW_SESSION:
			return {
				...state,
				session: {
					username: payload.username,
					password: payload.password,
				},
			}
	}
}

export default UsersReducer
