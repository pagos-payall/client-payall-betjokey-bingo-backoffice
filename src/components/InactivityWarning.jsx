'use client';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useUser from '@/hooks/useUser';

const InactivityWarning = ({ sessionTime = 600000 }) => {
	const { isLogged } = useUser();
	const warningTimeoutRef = useRef(null);
	const hasShownWarningRef = useRef(false);
	const lastActivityRef = useRef(Date.now());

	const resetWarnings = () => {
		// Only reset if logged in
		if (!isLogged) return;
		
		lastActivityRef.current = Date.now();
		hasShownWarningRef.current = false;
		
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current);
		}

		// Schedule warning at 1 minute before logout (9 minutes of inactivity for 10 min session)
		warningTimeoutRef.current = setTimeout(() => {
			// Double check if still logged in
			if (!hasShownWarningRef.current && isLogged) {
				hasShownWarningRef.current = true;
				toast.warning('⏰ Tu sesión expirará en 1 minuto por inactividad. Mueve el mouse o haz clic para mantenerla activa.', {
					autoClose: 50000, // Show for 50 seconds
					position: "top-right",
					onClick: () => {
						resetWarnings();
					}
				});
			}
		}, sessionTime - 60000); // Warning at 9 minutes (for 10 min session)
	};

	useEffect(() => {
		if (!isLogged) return;

		// Listen for user activity
		const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
		
		const handleActivity = () => {
			resetWarnings();
		};

		events.forEach(event => window.addEventListener(event, handleActivity));

		// Initial setup
		resetWarnings();

		return () => {
			if (warningTimeoutRef.current) {
				clearTimeout(warningTimeoutRef.current);
			}
			events.forEach(event => window.removeEventListener(event, handleActivity));
		};
	}, [isLogged, sessionTime]);

	return null;
};

export default InactivityWarning;