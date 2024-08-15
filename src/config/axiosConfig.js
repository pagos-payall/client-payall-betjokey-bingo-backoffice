import axios from 'axios';

const instance = axios.create({
	withCredentials: true,
	baseURL: process.env.API_HOST + process.env.API_URL,
	timeout: 30000,
	auth: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
	},
});

export default instance;
