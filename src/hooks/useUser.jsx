import UsersContext from '@/context/users/UsersContext'
import { useContext, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function useUser() {
	const {
		username,
		session,
		setTokenStatus,
		token_status,
		setActUsername,
		setNewSession,
	} = useContext(UsersContext)
	const router = useRouter()

	const login = useCallback(
		(user) => {
			setActUsername(user)
			setTokenStatus(true)
		},
		[setActUsername]
	)

	const getUser = username

	const logout = useCallback(() => {
		setActUsername('')
		setTokenStatus()
		router.push('/')
	}, [setActUsername])

	const refreshToken = useCallback(
		(boolean = false) => {
			setTokenStatus(!boolean)
		},
		[setTokenStatus]
	)

	const newSession = useCallback(
		(data) => {
			setNewSession({
				username: data.username || undefined,
				password: data.password || undefined,
			})
		},
		[setNewSession]
	)

	console.log(username)

	return {
		isLogged: token_status,
		username,
		getUser,
		session,
		login,
		logout,
		refreshToken,
		newSession,
	}
}
