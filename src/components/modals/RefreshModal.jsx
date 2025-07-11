'use client';
import { useEffect, useRef, useState } from 'react';
import Button from '../Button';
import useUser from '@/hooks/useUser.jsx';
import useFetch from '@/hooks/useFetch';
import { useRouter } from 'next/navigation';
import { ModalContainer, ModalBox } from './ModalStyles';
import { toast } from 'react-toastify';
import tokenManager from '@/services/tokenManager';

const RefreshModal = () => {
	const {
		isExpired,
		logout,
		username,
		session,
		newSession,
		login,
	} = useUser();
	const { fetchAPICall } = useFetch();
	const router = useRouter();
	const [timeLeft, setTimeLeft] = useState(30);
	const timeoutRef = useRef(null);
	const intervalRef = useRef(null);
	const [warningShown, setWarningShown] = useState(false);
	const refreshInProgress = useRef(false);

	// Limpiar timeouts e intervals
	const clearTimers = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	// Subscribe to token manager events
	useEffect(() => {
		const unsubscribe = tokenManager.subscribe((event) => {
			if (event.status === 'expired' && !session.username) {
				// Token expired - modal will show automatically, no toast needed
				setWarningShown(true);
			} else if (event.status === 'active' && event.refreshed) {
				// Token was refreshed successfully
				setWarningShown(false);
				setTimeLeft(30);
				clearTimers();
			}
		});

		return () => unsubscribe();
	}, [session.username, warningShown]);

	// Configurar el timeout de 30 segundos cuando se muestra el modal
	useEffect(() => {
		if (isExpired && !session.username) {
			// Iniciar countdown
			intervalRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearTimers();
						handleLogout();
						return 0;
					}
					// Mostrar advertencia secundaria a los 15 segundos
					if (prev === 15) {
						toast.error('¡Atención! Quedan solo 15 segundos para cerrar sesión', {
							autoClose: 5000
						});
					}
					return prev - 1;
				});
			}, 1000);

			// Timeout de 30 segundos
			timeoutRef.current = setTimeout(() => {
				clearTimers();
				handleLogout();
			}, 30000);

			// Limpiar al desmontar
			return () => {
				clearTimers();
				setWarningShown(false);
			};
		}
	}, [isExpired, session.username]);

	function handleLogout() {
		clearTimers();
		fetchAPICall('/auth/logout', 'put', { username }).finally(() => logout());
	}

	async function handleRefreshToken() {
		// Evitar múltiples solicitudes simultáneas
		if (refreshInProgress.current) {
			toast.info('Ya se está actualizando la sesión...');
			return;
		}
		
		refreshInProgress.current = true;
		clearTimers(); // Limpiar timers al responder
		
		try {
			// Use centralized token manager which handles the refresh
			await tokenManager.refreshToken();
			
			// No recargar la página para mantener el trabajo del usuario
			toast.success('Sesión actualizada exitosamente');
			
			// The modal will be hidden automatically when isExpired changes to false
			
		} catch (error) {
			console.error('Token refresh failed:', error);
			toast.error('No se pudo actualizar la sesión');
			// Dar un pequeño delay antes de hacer logout
			setTimeout(() => handleLogout(), 2000);
		} finally {
			refreshInProgress.current = false;
		}
	}

	function handleNewSession() {
		fetchAPICall('/auth', 'put', session, true, true)
			.then(({ result }) => {
				newSession({});
				setTimeout(router.push('/dashboard'), 2000);
				login({
					username: result.username,
					level: result.level,
				});
			})
			.catch(() => {
				newSession({});
			});
	}

	const LoggedModal = () => (
		<ModalContainer>
			<ModalBox $maxHeight={'300px'}>
				<h1>¿Desea Mantener su sesión activa?</h1>
				<p
					style={{
						color: '#999',
						fontSize: '14px',
						margin: '10px 0',
					}}
				>
					Tiempo restante: {timeLeft} segundos
				</p>
				<div style={{ display: 'flex', gap: '5px', width: '90%' }}>
					<Button color={'red'} $w={50} onClick={handleLogout}>
						Salir
					</Button>
					<Button color={'green'} $w={50} onClick={handleRefreshToken}>
						Mantener
					</Button>
				</div>
			</ModalBox>
		</ModalContainer>
	);

	const SessionModal = () => (
		<ModalContainer>
			<ModalBox $maxHeight={'300px'}>
				<h2>
					Se detecto otra session activa ¿Desea continuar en esta session?
				</h2>
				<div style={{ display: 'flex', gap: '5px', width: '90%' }}>
					<Button color={'red'} $w={50} onClick={() => newSession({})}>
						Cancelar
					</Button>
					<Button color={'green'} $w={50} onClick={handleNewSession}>
						Login
					</Button>
				</div>
			</ModalBox>
		</ModalContainer>
	);

	return session.username ? <SessionModal /> : isExpired && <LoggedModal />;
};

export default RefreshModal;
