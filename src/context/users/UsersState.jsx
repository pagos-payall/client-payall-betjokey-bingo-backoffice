'use client'
import { useEffect, useReducer } from 'react'
import UsersContext from './UsersContext'
import UsersReducer from './UsersReducer'
import Cookies from 'js-cookie'

const UsersState = ({ children }) => {
	const initialState = {
		username: '',
		level: '',
		token_status:
			Cookies.get('username', {
				expires: 0.29,
				path: '/',
				sameSite: 'Strict',
			}) && 'active', // active, expired, undefined
		session: {
			username: undefined,
			password: undefined,
		},
	}

	const [state, dispatch] = useReducer(UsersReducer, initialState)

	const setActUsername = async (username, level) => {
		if (!username) {
			Cookies.remove('username', {
				expires: 0.29,
				path: '/',
				sameSite: 'strict',
			})
			Cookies.remove('level', {
				expires: 0.29,
				path: '/',
				sameSite: 'strict',
			})
		} else {
			Cookies.set('username', username, {
				expires: 0.29,
				path: '/',
				sameSite: 'strict',
			})
			Cookies.set('level', level, {
				expires: 0.29,
				path: '/',
				sameSite: 'strict',
			})
		}

		dispatch({
			type: 'SET_ACT_USERNAME',
			payload: {
				username,
				level,
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
		setActUsername(
			Cookies.get('username', {
				expires: 0.29,
				path: '/',
				sameSite: 'Strict',
			}) || undefined,
			Cookies.get('level', {
				expires: 0.29,
				path: '/',
				sameSite: 'Strict',
			}) || undefined
		)
	}, [])

	return (
		<UsersContext.Provider
			value={{
				username: state.username,
				level: state.level,
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
