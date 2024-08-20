'use client'
import { useReducer } from 'react'
import RoomsContext from './RoomsContext'
import RoomsReducer from './RoomsReducer'
import useFetch from '@/hooks/useFetch'

const RoomsState = ({ children }) => {
	const { fetchAPICall } = useFetch()
	const initialState = {
		rooms: [],
		users: [],
	}
	const [state, dispatch] = useReducer(RoomsReducer, initialState)

	const getRooms = async (notification) => {
		let response
		let boolean = notification ? notification : false

		try {
			response = await fetchAPICall(
				'bingo/rooms',
				'get',
				undefined,
				boolean
			).then((data) => data.result.reverse())
		} catch (error) {
			response = []
		}

		dispatch({
			type: 'GET_ROOMS',
			payload: response,
		})
	}

	const getUsers = async (notification) => {
		let response
		let boolean = notification ? notification : false

		try {
			response = await fetchAPICall(
				'/backOffice',
				'get',
				undefined,
				boolean
			).then((data) => data.result.reverse())
		} catch (error) {
			console.log(error)

			response = []
		}

		dispatch({
			type: 'GET_USERS',
			payload: response,
		})
	}

	return (
		<RoomsContext.Provider
			value={{
				rooms: state.rooms,
				users: state.users,
				getRooms,
				getUsers,
			}}
		>
			{children}
		</RoomsContext.Provider>
	)
}

export default RoomsState
