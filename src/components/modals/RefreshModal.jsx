'use client';
import Button from '../Button';
import useUser from '@/hooks/useUser.jsx';
import useFetch from '@/hooks/useFetch';
import { useRouter } from 'next/navigation';
import { ModalContainer, ModalBox } from './ModalStyles';

const RefreshModal = () => {
	const {
		isExpired,
		logout,
		refreshToken,
		username,
		session,
		newSession,
		login,
	} = useUser();
	const { fetchAPICall } = useFetch();
	const router = useRouter();

	function handleLogout() {
		fetchAPICall('/auth/logout', 'put', { username }).finally(() => logout());
	}

	async function handleRefreshToken() {
		try {
			// Call internal refresh endpoint directly
			const response = await fetch('/api/auth', {
				method: 'HEAD',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				// Refresh successful, update token status
				await refreshToken();
				// Force page reload to clear expired state
				window.location.reload();
			} else {
				// Refresh failed, logout
				handleLogout();
			}
		} catch (error) {
			console.error('Token refresh failed:', error);
			handleLogout();
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
				<h1>¿Desea Mantener su session activa?</h1>
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
