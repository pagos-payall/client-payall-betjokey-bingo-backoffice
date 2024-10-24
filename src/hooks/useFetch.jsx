import { toast } from 'react-toastify'
import useUser from './useUser'
import instance from '@/config/axiosConfig.js'

export default function useFetch() {
	const { logout, refreshToken, username } = useUser()

	const errorHandler = async (status) => {
		if (status === 498) {
			const response = instance({
				method: 'put',
				url: '/auth/logout',
				data: { username },
			})
			await response
			return logout()
		}
		if (status === 401) throw logout()
		if (status === 403) throw refreshToken(true)
		if (status === 304) throw { status: 304 }
	}

	const fetchAPICall = async (
		route,
		method = 'get',
		body = {},
		notification = true
	) => {
		const response = instance({
			method: method,
			url: route,
			data: body,
			params: method === 'get' && body,
		})

		if (notification) {
			const promise_toast = toast.promise(response, {
				pending: 'Procesando solicitud...',
				success: 'Operación exitosa 👌',
				error: {
					render({ data }) {
						let message = data?.response?.data?.error || 'Solicitud fallida' // Mensaje por defecto

						if (data?.response?.status === 304) {
							message = 'Existe sesión activa'
						}
						return message // Muestra el mensaje de error
					},
				},
			})

			try {
				const res = await promise_toast
				return res.data
			} catch (e) {
				const status = e?.response?.status || null
				throw await errorHandler(status)
			}
		}

		try {
			const res = await response
			return res.data
		} catch {
			throw await errorHandler()
		}
	}

	return { fetchAPICall }
}
