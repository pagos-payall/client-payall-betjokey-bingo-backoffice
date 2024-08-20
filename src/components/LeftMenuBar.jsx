'use client'
import { IconComponent } from './SubHeaderBar'
import {
	homeIcon,
	boltIcon,
	mailIcon,
	logOutIcon,
	settingsIcon,
	manageAccountsIcon,
} from '../data/icons'
import { useRouter } from 'next/navigation'
import HeaderTitleComp from './styled/HeaderTitleComp'
import { MenuComponent, UserHeaderComp } from './styled/MenuComponents'
import useUser from '@/hooks/useUser.jsx'
import useFetch from '@/hooks/useFetch'

function LeftMenuBar() {
	const router = useRouter()
	const { username, logout } = useUser()
	const { fetchAPICall } = useFetch()

	function handleLogout() {
		fetchAPICall('/auth/logout', 'put', { username }).then(() => logout())
	}

	return (
		<MenuComponent>
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
					onClick={() => router.push('/dashboard/historyLog')}
				/>
				<IconComponent size={25} url={mailIcon} />
				<IconComponent size={25} url={boltIcon} />
				<IconComponent
					size={25}
					url={manageAccountsIcon}
					onClick={() => router.push('/usersManagerView/historyLog')}
				/>
				<IconComponent size={25} url={logOutIcon} onClick={handleLogout} />
			</div>
			<div
				style={{
					display: 'flex',
					flex: 0.5,
					flexDirection: 'column',
					justifyContent: 'flex-end',
				}}
			>
				<IconComponent size={25} url={settingsIcon} />
			</div>
		</MenuComponent>
	)
}

export default LeftMenuBar
