import UsersContext from '@/context/users/UsersContext';
import { useContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/config/axiosConfig';
import websocketService from '@/services/websocketService';

export default function useUser() {
	const {
		username,
		level,
		session,
		setTokenStatus,
		token_status,
		setActUsername,
		setNewSession,
	} = useContext(UsersContext);
	const router = useRouter();
	const [isValidating, setIsValidating] = useState(false);

	const login = useCallback(
		async (data) => {
			try {
				// Server-side validation will be handled by API
				await setActUsername(data.username, data.level);
				setTokenStatus(true);
				return { success: true };
			} catch (error) {
				console.error('Login failed:', error);
				return { success: false, error: error.message };
			}
		},
		[setActUsername, setTokenStatus]
	);

	const getUser = username;

	const logout = useCallback(
		async (logoutAllDevices = false) => {
			try {
				// Disconnect WebSocket before logout
				if (websocketService.isConnected()) {
					console.log('🔌 Disconnecting WebSocket before logout');
					websocketService.disconnect();
				}
				
				if (logoutAllDevices) {
					// Call API to invalidate all sessions
					await axios.post('/auth/logout-all');
				} else {
					// Call API to invalidate current session
					await axios.post('/auth/logout');
				}
			} catch (error) {
				console.error('Logout API call failed:', error);
			} finally {
				// Always clear local state
				setActUsername('');
				setTokenStatus();
				router.push('/login');
			}
		},
		[setActUsername, setTokenStatus, router]
	);

	const refreshToken = useCallback(async (forceRefresh = true) => {
		setIsValidating(true);
		try {
			if (forceRefresh) {
				const response = await axios.head('/auth');
				if (response.data.success) {
					setTokenStatus(true);
					return { success: true };
				} else {
					throw new Error('Token refresh failed');
				}
			} else {
				// Solo marcar como expirado sin hacer refresh
				setTokenStatus(false);
				return { success: false };
			}
		} catch (error) {
			console.error('Token refresh failed:', error);
			setTokenStatus(false);
			// Solo redirigir si forceRefresh es true
			if (forceRefresh) {
				router.push('/login');
			}
			return { success: false, error: error.message };
		} finally {
			setIsValidating(false);
		}
	}, [setTokenStatus, router]);

	const newSession = useCallback(
		(data) => {
			setNewSession({
				username: data.username || undefined,
				password: data.password || undefined,
			});
		},
		[setNewSession]
	);

	// Validate permissions for specific actions
	const hasPermission = useCallback(
		(action, resource) => {
			if (!level) return false;

			// Map common action aliases to actual permissions
			const actionMapping = {
				edit: 'update',
				modify: 'update',
				remove: 'delete',
				view: 'read',
			};

			// Use mapped action or original if no mapping exists
			const actualAction = actionMapping[action] || action;

			const rolePermissions = {
				admin: ['create', 'read', 'update', 'delete', 'archive'],
				supervisor: ['create', 'read', 'update'],
				coordinador: ['create', 'read', 'update'],
				operador: ['read'],
			};

			return rolePermissions[level]?.includes(actualAction) || false;
		},
		[level]
	);

	// Check if user can access specific paths
	const canAccessPath = useCallback(
		(path) => {
			if (!level) return false;

			const rolePaths = {
				admin: ['dashboard', 'usersManagerView', 'reports'],
				supervisor: ['dashboard', 'reports'],
				coordinador: ['dashboard', 'usersManagerView'],
				operador: ['dashboard'],
			};

			return (
				rolePaths[level]?.some((allowedPath) => path.includes(allowedPath)) ||
				false
			);
		},
		[level]
	);

	// DISABLED: Auto-refresh token to prevent conflicts with modal-based refresh
	// useEffect(() => {
	// 	if (token_status === 'active') {
	// 		const interval = setInterval(() => {
	// 			refreshToken()
	// 		}, 14 * 60 * 1000) // Refresh every 14 minutes
	//
	// 		return () => clearInterval(interval)
	// 	}
	// }, [token_status, refreshToken])

	return {
		isLogged: token_status === 'active',
		isExpired: token_status === 'expired',
		token_status,
		username,
		level,
		getUser,
		session,
		isValidating,
		login,
		logout,
		refreshToken,
		newSession,
		hasPermission,
		canAccessPath,
	};
}
