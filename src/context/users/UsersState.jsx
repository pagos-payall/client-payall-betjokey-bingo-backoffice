'use client';
import { useReducer, useEffect } from 'react';
import UsersContext from './UsersContext';
import UsersReducer from './UsersReducer';
import fetchAPICall from '@/services/fetchAPICall';

const UsersState = ({ children }) => {
	const initialState = {
		users: [],
		username: sessionStorage.getItem('user_bj_bo') || undefined,
		jwt: sessionStorage.getItem('jwt_bj_bo') || undefined,
	};

	const [state, dispatch] = useReducer(UsersReducer, initialState);

	const getUsers = async (notification) => {
		let response;
		let boolean = notification ? notification : false;

		try {
			response = await fetchAPICall(
				'/backOffice',
				'get',
				undefined,
				boolean
			).then((data) => data.result.reverse());
		} catch (error) {
			response = [];
		}

		dispatch({
			type: 'GET_USERS',
			payload: response,
		});
	};

	const setActUsername = (username, jwt) => {
		if (username && jwt) {
			window.sessionStorage.setItem('jwt_bj_bo', jwt);
			window.sessionStorage.setItem('user_bj_bo', username);
		} else {
			window.sessionStorage.removeItem('jwt_bj_bo');
			window.sessionStorage.removeItem('user_bj_bo');
		}

		dispatch({
			type: 'SET_ACT_USERNAME',
			payload: {
				username,
				jwt,
			},
		});
	};

	useEffect(() => {
		getUsers();
	}, []);

	return (
		<UsersContext.Provider
			value={{
				users: state.users,
				username: state.username,
				jwt: state.jwt,
				getUsers,
				setActUsername,
			}}
		>
			{children}
		</UsersContext.Provider>
	);
};

export default UsersState;
