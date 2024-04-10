'use client';
import { ToastContainer, Bounce } from 'react-toastify';

const Toastbox = () => (
	<ToastContainer
		position='top-right'
		autoClose={2000}
		hideProgressBar={false}
		newestOnTop={false}
		closeOnClick={false}
		rtl={false}
		pauseOnFocusLoss
		draggable
		pauseOnHover
		theme='dark'
		transition={Bounce}
	/>
);

export default Toastbox;
