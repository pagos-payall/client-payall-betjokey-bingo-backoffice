import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import RoomsState from '@/context/rooms/RoomsState'
import UsersState from '@/context/users/UsersState'
import Toastbox from '@/components/ToastBox'
import RefreshModal from '@/components/modals/RefreshModal'
import LogoutTimer from '@/components/LogoutTimer'

const inter = Inter({ subsets: ['latin'] })
export const metadata = {
	title: 'BetjockeyBackoffice',
	description: 'panel web de betjockey',
}

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<UsersState>
						<LogoutTimer />
						<RefreshModal />
						<Toastbox />
						<RoomsState>{children}</RoomsState>
				</UsersState>
			</body>
		</html>
	)
}
