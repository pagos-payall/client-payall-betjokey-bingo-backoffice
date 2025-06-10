import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import RoomsState from '@/context/rooms/RoomsState'
import UsersState from '@/context/users/UsersState'
import Toastbox from '@/components/ToastBox'
import RefreshModal from '@/components/modals/RefreshModal'
import LogoutTimer from '@/components/LogoutTimer'
import TokenStatusWatcher from '@/components/TokenStatusWatcher'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })
export const metadata = {
	title: 'BetjockeyBackoffice',
	description: 'panel web de betjockey',
}

export default function RootLayout({ children }) {
	const headersList = headers();
	const tokenStatus = headersList.get('x-token-status') || 'unknown';

	return (
		<html lang='en'>
			<head>
				<meta name="token-status" content={tokenStatus} />
			</head>
			<body className={inter.className}>
				<UsersState>
						<TokenStatusWatcher />
						<LogoutTimer />
						<RefreshModal />
						<Toastbox />
						<RoomsState>{children}</RoomsState>
				</UsersState>
			</body>
		</html>
	)
}
