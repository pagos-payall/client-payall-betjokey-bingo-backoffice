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
		// For 401 errors, don't auto-refresh - let the modal handle it
		if (error.response?.status === 401) {
			console.log('🔑 401 detected, letting modal handle refresh');
			// Don't redirect automatically, let RefreshModal handle this
			return Promise.reject(error);
		}

		// For 403 errors, just log and let component handle it
		if (error.response?.status === 403) {
			console.error('Access denied:', error.response.data?.message);
			// Don't redirect automatically - let components handle 403 errors
		}

		return Promise.reject(error);
	}
);

export default instance;
