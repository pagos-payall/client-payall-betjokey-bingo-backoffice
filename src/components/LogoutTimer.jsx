'use client'
import { useEffect, useState, useRef } from 'react'
import useUser from '@/hooks/useUser'
import useFetch from '@/hooks/useFetch'

const LogoutTimer = ({ logoutTime = 300000 }) => {
	const [timeLeft, setTimeLeft] = useState(logoutTime)
	const timeoutRef = useRef(null)
	const { logout, isLogged, username } = useUser()
	const { fetchAPICall } = useFetch()

	const handleLogout = () =>
		fetchAPICall('/auth/logout', 'put', { username }).then(() => logout())

	const resetTimeout = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		setTimeLeft(logoutTime)
		timeoutRef.current = setTimeout(handleLogout, logoutTime)
	}

	useEffect(() => {
		const events = ['click', 'mousemove', 'keydown']
		if (isLogged) {
			events.forEach((event) => window.addEventListener(event, resetTimeout))

			timeoutRef.current = setTimeout(handleLogout, logoutTime)
		}
		return () => {
			clearTimeout(timeoutRef.current)
			events.forEach((event) => window.removeEventListener(event, resetTimeout))
		}
	}, [logoutTime, isLogged])

	return null
}

export default LogoutTimer
