'use client';
import { IconComponent } from './SubHeaderBar';
import { homeIcon, logOutIcon, manageAccountsIcon } from '../data/icons';
import { useRouter } from 'next/navigation';
import HeaderTitleComp from './styled/HeaderTitleComp';
import { MenuComponent, UserHeaderComp } from './styled/MenuComponents';
import useUser from '@/hooks/useUser.jsx';
import useFetch from '@/hooks/useFetch';
import { useState } from 'react';
import AlertConfirmModal from './modals/AlertConfirmModal';

function LeftMenuBar() {
	const router = useRouter();
	const { fetchAPICall } = useFetch();
	const [modalView, setModalView] = useState(false);
	const { username, logout, getUser } = useUser();
	const [modalContent] = useState({
		title: '¿Estás seguro que deseas salir?',
		confirmText: 'Confirmar',
	});
	function handleLogout() {
		fetchAPICall('/auth/logout', 'put', { username }).then(() => logout());
	}

	return (
		<MenuComponent>
			{modalView && (
				<AlertConfirmModal
					method={handleLogout}
					modalContent={modalContent}
					closeModal={() => setModalView(false)}
				/>
			)}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					flex: 1.5,
					gap: '5px',
				}}
			>
				<HeaderTitleComp />
				<UserHeaderComp>
					<h3 style={{ margin: 'auto', textAlign: 'center' }}>
						{username?.slice(0, 2)}
					</h3>
				</UserHeaderComp>
				<IconComponent
					size={25}
					url={homeIcon}
					onClick={() => router.push('/dashboard')}
				/>
				<IconComponent
					size={25}
					url={manageAccountsIcon}
					onClick={() => router.push('/usersManagerView/historyLog')}
				/>
				<IconComponent
					size={25}
					url={logOutIcon}
					onClick={() => setModalView(true)}
				/>
			</div>
			<div
				style={{
					display: 'flex',
					flex: 0.5,
					flexDirection: 'column',
					justifyContent: 'flex-end',
				}}
			>
				{/* <IconComponent size={25} url={settingsIcon} /> */}
			</div>
		</MenuComponent>
	);
}

export default LeftMenuBar;
