import axios from 'axios';

// Use public environment variables for client-side
const instance = axios.create({
	withCredentials: true,
	baseURL: process.env.NEXT_PUBLIC_API_HOST + process.env.NEXT_PUBLIC_API_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// Request interceptor to add CSRF token and other security headers
instance.interceptors.request.use(
	(config) => {
		// Add CSRF token if available
		const csrfToken = document
			.querySelector('meta[name="csrf-token"]')
			?.getAttribute('content');
		if (csrfToken) {
			config.headers['X-CSRF-Token'] = csrfToken;
		}

		// Add security headers
		config.headers['X-Requested-With'] = 'XMLHttpRequest';
		config.headers['Cache-Control'] = 'no-cache';

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle token refresh
instance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		// Log structured errors for debugging
		if (error.response?.data?.data?.code) {
			console.log('🚨 API Error:', {
				code: error.response.data.data.code,
				message: error.response.data.error,
				restrictions: error.response.data.data.restrictions,
			});
		}

		// Handle 401 errors with automatic retry (but not for auth endpoints)
		if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth')) {
			console.log('🔑 401 detected, attempting token refresh');
			originalRequest._retry = true;

			// For now, just reject to avoid circular dependency
			// The RefreshModal will handle the token refresh
			return Promise.reject(error);
		}

		// Handle 498 Token Expired errors (but not for auth endpoints)
		if (error.response?.status === 498 && !originalRequest._retry && !originalRequest.url.includes('/auth')) {
			console.log('⏰ 498 Token expired, attempting refresh');
			originalRequest._retry = true;

			// For now, just reject to avoid circular dependency
			// The RefreshModal will handle the token refresh
			return Promise.reject(error);
		}

		// Handle 403 errors - often means token is expired
		if (error.response?.status === 403 && !originalRequest._retry && !originalRequest.url.includes('/auth')) {
			console.log('🚫 403 Forbidden - Token may be expired');
			originalRequest._retry = true;
			
			// Import tokenManager dynamically to avoid circular dependency
			import('@/services/tokenManager').then(({ default: tokenManager }) => {
				// Notify token manager that token is expired
				tokenManager.notifySubscribers({ status: 'expired' });
			});
			
			// Also update the meta tag
			const tokenStatusMeta = document.querySelector('meta[name="token-status"]');
			if (tokenStatusMeta) {
				tokenStatusMeta.setAttribute('content', 'expired');
			}
			
			// Dispatch a custom event to notify TokenStatusWatcher
			window.dispatchEvent(new Event('token-expired'));
			
			return Promise.reject(error);
		}

		return Promise.reject(error);
	}
);

export default instance;
