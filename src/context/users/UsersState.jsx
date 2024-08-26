'use client'
import { useEffect, useReducer } from 'react'
import UsersContext from './UsersContext'
import UsersReducer from './UsersReducer'
import Cookies from 'js-cookies'

const UsersState = ({ children }) => {
	const initialState = {
		username: '',
		token_status: undefined, // active, expired, undefined
		session: {
			username: undefined,
			password: undefined,
		},
	}

	const [state, dispatch] = useReducer(UsersReducer, initialState)

	const setActUsername = async (username) => {
		if (!username) {
			Cookies.removeItem('username')
		} else {
			Cookies.setItem('username', username, {
				expires: 0.29,
				samesite: 'strict',
			})
		}

		dispatch({
			type: 'SET_ACT_USERNAME',
			payload: {
				username,
			},
		})
	}

	const setTokenStatus = (status) => {
		const token_status =
			status === undefined ? undefined : status ? 'active' : 'expired'

		dispatch({
			type: 'SET_TOKEN_STATUS',
			payload: {
				token_status,
			},
		})
	}

	const setNewSession = ({ username, password }) => {
		dispatch({
			type: 'SET_NEW_SESSION',
			payload: {
				username,
				password,
			},
		})
	}

	useEffect(() => {
		setActUsername(Cookies.getItem('username') || undefined)
		console.log(Cookies.getItem('username'))
	}, [])

	return (
		<UsersContext.Provider
			value={{
				username: state.username,
				token_status: state.token_status,
				session: state.session,
				setActUsername,
				setTokenStatus,
				setNewSession,
			}}
		>
			{children}
		</UsersContext.Provider>
	)
}

export default UsersState
