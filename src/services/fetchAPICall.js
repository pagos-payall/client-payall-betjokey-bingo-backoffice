import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
	baseURL: process.env.API_HOST + process.env.API_URL,
	timeout: 30000,
	auth: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
	},
	responseType: 'json',
});

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
	});

	if (notification) {
		const promise = toast.promise(response, {
			pending: 'Procesando solicitud...',
			success: 'Operacion exitosa 👌',
			error: 'Solicitud fallida',
		});

		return promise
			.then((res) => res.data)
			.catch((e) => toast.error(e.response.data.error));
	} else {
		return response
			.then((res) => res.data)
			.catch((error) => {
				console.log(error);
				toast.error('Solicitud fallida');
			});
	}
};

export default fetchAPICall;
