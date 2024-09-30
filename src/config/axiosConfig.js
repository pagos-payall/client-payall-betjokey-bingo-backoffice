import axios from 'axios';

const instance = axios.create({
	withCredentials: true,
	baseURL: process.env.API_HOST + process.env.API_URL,
	timeout: 30000,
});

export default instance;
