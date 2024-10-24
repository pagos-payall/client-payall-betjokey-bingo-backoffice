'use client'
import { useReducer } from 'react'
import RoomsContext from './RoomsContext'
import RoomsReducer from './RoomsReducer'
import useFetch from '@/hooks/useFetch'
import useUser from '@/hooks/useUser'

const RoomsState = ({ children }) => {
	const { fetchAPICall } = useFetch()
	const { level } = useUser()
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

			if (level !== 'admin')
				response = response.filter((user) => user.role !== 'admin')
		} catch (error) {
			response = []
		}

		dispatch({
			type: 'GET_USERS',
			payload: response,
		})
	}

	const setRooms = (data) => {
		dispatch({
			type: 'GET_ROOMS',
			payload: data,
		})
	}

	const setUsers = async (data) => {
		dispatch({
			type: 'GET_USERS',
			payload: data,
		})
	}

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
	)
}

export default RoomsState
