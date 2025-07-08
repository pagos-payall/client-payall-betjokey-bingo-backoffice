'use client'
import { useEffect, useState, useRef } from 'react'
import useUser from '@/hooks/useUser'
import useFetch from '@/hooks/useFetch'
import tokenManager from '@/services/tokenManager'

const LogoutTimer = ({ logoutTime = 600000 }) => { // 10 minutes (600 seconds)
	const [_, setTimeLeft] = useState(logoutTime)
	const timeoutRef = useRef(null)
	const { logout, isLogged, username } = useUser()
	const { fetchAPICall } = useFetch()
	const lastActivityRef = useRef(Date.now())

	const handleLogout = () =>
		fetchAPICall('/auth/logout', 'put', { username }).finally(() => logout())

	const resetTimeout = () => {
		// Update last activity time
		lastActivityRef.current = Date.now()
		
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		setTimeLeft(logoutTime)
		
		// Check if we should logout based on token expiry
		const tokenExpiry = tokenManager.getTokenExpiry()
		if (tokenExpiry) {
			const now = Date.now()
			const timeUntilExpiry = tokenExpiry - now
			
			// If token will expire before inactivity timeout, don't set logout timer
			// Let the token refresh mechanism handle it
			if (timeUntilExpiry < logoutTime && timeUntilExpiry > 0) {
				return
			}
		}
		
		timeoutRef.current = setTimeout(handleLogout, logoutTime)
	}

	useEffect(() => {
		const events = ['click', 'mousemove', 'keydown']

		if (isLogged) {
			events.forEach((event) => window.addEventListener(event, resetTimeout))
			resetTimeout() // Initial setup
			
			// Subscribe to token events
			const unsubscribe = tokenManager.subscribe((event) => {
				if (event.status === 'expired' || event.status === 'failed') {
					// Token expired, cancel inactivity timer
					if (timeoutRef.current) {
						clearTimeout(timeoutRef.current)
					}
				} else if (event.status === 'active' && event.refreshed) {
					// Token refreshed, reset inactivity timer
					resetTimeout()
				}
			})
			
			return () => {
				unsubscribe()
				clearTimeout(timeoutRef.current)
				events.forEach((event) => window.removeEventListener(event, resetTimeout))
			}
		}
		return () => {
			clearTimeout(timeoutRef.current)
			events.forEach((event) => window.removeEventListener(event, resetTimeout))
		}
	}, [logoutTime, isLogged])

	return null
}

export default LogoutTimer
