'use client';
import { useReducer, useEffect } from 'react';
import RoomsContext from './RoomsContext';
import RoomsReducer from './RoomsReducer';
import fetchAPICall from '@/services/fetchAPICall';

const RoomsState = ({ children }) => {
	const initialState = {
		rooms: [],
		username: 'test',
		display_view: '/dashboard/roomForm',
	};
	const [state, dispatch] = useReducer(RoomsReducer, initialState);

	const getRooms = async (notification) => {
		let response;
		let boolean = notification ? notification : false;

		try {
			response = await fetchAPICall(
				'bingo/rooms',
				'get',
				undefined,
				boolean
			).then((data) => data.result.reverse());
		} catch (error) {
			response = [];
		}

		dispatch({
			type: 'GET_ROOMS',
			payload: response,
		});
	};

	useEffect(() => {
		getRooms();
	}, []);

	return (
		<RoomsContext.Provider
			value={{
				rooms: state.rooms,
				display_view: state.display_view,
				username: state.username,
				getRooms,
			}}
		>
			{children}
		</RoomsContext.Provider>
	);
};

export default RoomsState;
