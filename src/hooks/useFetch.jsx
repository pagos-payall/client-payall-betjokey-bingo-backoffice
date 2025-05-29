import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import useUser from './useUser';
import instance from '@/config/axiosConfig.js';

// Constantes para códigos de estado HTTP
const HTTP_STATUS = {
	NOT_MODIFIED: 304,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	TOKEN_EXPIRED: 498,
};

// Mensajes de error predeterminados
const ERROR_MESSAGES = {
	DEFAULT: 'Solicitud fallida',
	SESSION_ACTIVE: 'Existe sesión activa',
	PROCESSING: 'Procesando solicitud...',
	SUCCESS: 'Operación exitosa 👌',
};

// Clase personalizada para errores del hook
class FetchError extends Error {
	constructor(message, status, originalError) {
		super(message);
		this.name = 'FetchError';
		this.status = status;
		this.originalError = originalError;
	}
}

export default function useFetch() {
	const { logout, refreshToken, username, isLogged } = useUser();
	const router = useRouter();

	/**
	 * Manejador centralizado de errores según el código de estado HTTP
	 * @param {number} status - Código de estado HTTP
	 * @param {Error} originalError - Error original de axios
	 * @returns {Promise<void>}
	 */
	const handleErrorByStatus = async (status, originalError) => {
		switch (status) {
			case HTTP_STATUS.TOKEN_EXPIRED: {
				try {
					await instance({
						method: 'put',
						url: '/auth/logout',
						data: { username },
					});
				} catch (logoutError) {
					console.error('Error during logout:', logoutError);
				}
				// Ejecutar logout y lanzar error apropiado
				logout();
				throw new FetchError('Token expirado', status, originalError);
			}

			case HTTP_STATUS.UNAUTHORIZED: {
				// Ejecutar logout y lanzar error apropiado
				logout();
				throw new FetchError('No autorizado', status, originalError);
			}

			case HTTP_STATUS.FORBIDDEN: {
				// Intentar refresh token
				try {
					await refreshToken(true);
					// Si el refresh es exitoso, podríamos reintentar la petición original
					// Por ahora, lanzamos el error para mantener compatibilidad
					throw new FetchError(
						'Acceso prohibido - Token actualizado',
						status,
						originalError
					);
				} catch (refreshError) {
					// Si el refresh falla, lanzar error
					throw new FetchError('Acceso prohibido', status, originalError);
				}
			}

			case HTTP_STATUS.NOT_MODIFIED: {
				throw new FetchError(
					ERROR_MESSAGES.SESSION_ACTIVE,
					status,
					originalError
				);
			}

			default: {
				// Para otros errores, lanzar el error original o uno genérico
				if (originalError) {
					throw originalError;
				}
				throw new FetchError(ERROR_MESSAGES.DEFAULT, status, null);
			}
		}
	};

	/**
	 * Extrae el mensaje de error de la respuesta
	 * @param {Object} errorData - Objeto de error de axios
	 * @returns {string} Mensaje de error formateado
	 */
	const extractErrorMessage = (errorData) => {
		// Manejo específico para status 304
		if (errorData?.response?.status === HTTP_STATUS.NOT_MODIFIED) {
			return ERROR_MESSAGES.SESSION_ACTIVE;
		}

		// Intentar extraer mensaje de diferentes fuentes
		const message =
			errorData?.response?.data?.error ||
			errorData?.response?.data?.message ||
			errorData?.message ||
			ERROR_MESSAGES.DEFAULT;

		// Asegurar que siempre retornamos un string
		return typeof message === 'string' ? message : ERROR_MESSAGES.DEFAULT;
	};

	/**
	 * Configura y ejecuta la petición con notificaciones toast
	 * @param {Promise} requestPromise - Promesa de la petición axios
	 * @returns {Promise<any>} Datos de la respuesta
	 */
	const executeWithNotification = async (requestPromise) => {
		const toastPromise = toast.promise(requestPromise, {
			pending: ERROR_MESSAGES.PROCESSING,
			success: ERROR_MESSAGES.SUCCESS,
			error: {
				render({ data }) {
					return extractErrorMessage(data);
				},
			},
		});

		try {
			const response = await toastPromise;
			return response.data;
		} catch (error) {
			const status = error?.response?.status || null;
			await handleErrorByStatus(status, error);
		}
	};

	/**
	 * Ejecuta la petición sin notificaciones
	 * @param {Promise} requestPromise - Promesa de la petición axios
	 * @returns {Promise<any>} Datos de la respuesta
	 */
	const executeWithoutNotification = async (requestPromise) => {
		try {
			const response = await requestPromise;
			return response.data;
		} catch (error) {
			const status = error?.response?.status || null;
			await handleErrorByStatus(status, error);
		}
	};

	/**
	 * Función principal para realizar peticiones HTTP
	 * @param {string} route - Ruta del endpoint
	 * @param {string} method - Método HTTP (get, post, put, delete, etc.)
	 * @param {Object} body - Datos para enviar en la petición
	 * @param {boolean} notification - Si mostrar notificaciones toast
	 * @returns {Promise<any>} Datos de la respuesta
	 */
	const fetchAPICall = async (
		route,
		method = 'get',
		body = {},
		notification = true,
		auth = false
	) => {
		console.log('hola 0', auth, route);

		// Validación de usuario autenticado
		if (isLogged !== 'active' && method !== 'head' && !auth) {
			console.log('chao');

			router.push('/login');
			throw new FetchError('Usuario no autenticado', 401, null);
		}

		// Configuración de la petición
		const requestConfig = {
			method: method.toLowerCase(),
			url: route,
			...(method.toLowerCase() === 'get' ? { params: body } : { data: body }),
		};

		const requestPromise = instance(requestConfig);

		// Ejecutar con o sin notificación según el parámetro
		return notification
			? executeWithNotification(requestPromise)
			: executeWithoutNotification(requestPromise);
	};

	return { fetchAPICall };
}
