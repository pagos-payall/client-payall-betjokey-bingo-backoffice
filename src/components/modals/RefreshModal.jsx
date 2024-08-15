'use client'
import Button from '../Button'
import useUser from '@/hooks/useUser.jsx'
import useFetch from '@/hooks/useFetch'
import { useRouter } from 'next/navigation'
import { ModalContainer, ModalBox } from './ModalStyles'

const RefreshModal = () => {
	const {
		isLogged,
		logout,
		refreshToken,
		username,
		session,
		newSession,
		login,
	} = useUser()
	const { fetchAPICall } = useFetch()
	const router = useRouter()

	function handleLogout() {
		fetchAPICall('/auth/logout', 'put', { username }).then(() => logout())
	}

	function handleRefreshToken() {
		fetchAPICall('/auth', 'head').then(() => refreshToken())
	}

	function handleNewSession() {
		fetchAPICall('/auth', 'put', session).then(() => {
			newSession({})
			setTimeout(router.push('/dashboard'), 2000)
			login(session.username)
		})
	}

	const LoggedModal = () => (
		<ModalContainer>
			<ModalBox maxHeight={'300px'}>
				<h1>¿Desea Mantener su session activa?</h1>
				<div style={{ display: 'flex', gap: '5px', width: '90%' }}>
					<Button color={'red'} w={50} onClick={handleLogout}>
						Salir
					</Button>
					<Button color={'green'} w={50} onClick={handleRefreshToken}>
						Mantener
					</Button>
				</div>
			</ModalBox>
		</ModalContainer>
	)

	const SessionModal = () => (
		<ModalContainer>
			<ModalBox maxHeight={'300px'}>
				<h2>
					Se detecto otra session activa ¿Desea continuar en esta session?
				</h2>
				<div style={{ display: 'flex', gap: '5px', width: '90%' }}>
					<Button color={'red'} w={50} onClick={() => newSession({})}>
						Cancelar
					</Button>
					<Button color={'green'} w={50} onClick={handleNewSession}>
						Login
					</Button>
				</div>
			</ModalBox>
		</ModalContainer>
	)

	return session.username ? (
		<SessionModal />
	) : (
		isLogged === 'expired' && <LoggedModal />
	)
}

export default RefreshModal
