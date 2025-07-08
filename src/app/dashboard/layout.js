'use client'
import styled from 'styled-components'
import { theme } from '@/data/themes'
import LeftMenuBar from '@/components/LeftMenuBar'
import MiddleMenu from '@/components/dashboard/MiddleMenu'
import Toastbox from '@/components/ToastBox'
import { Suspense, useContext, useEffect, useState } from 'react'
import RoomsContext from '@/context/rooms/RoomsContext'
import dynamic from 'next/dynamic'

// Cargar el monitor solo en desarrollo
const WebSocketMonitor = dynamic(() => import('@/components/WebSocketMonitor'), {
  ssr: false
})

// Cargar diagnósticos en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@/utils/websocketDiagnostics');
  import('@/utils/websocketDebugger');
  import('@/utils/websocketTester');
  import('@/utils/checkSocketListeners');
}

const BodyComponent = styled.div`
	border: 2px solid;
	border-color: ${theme.dark.borders.primary};
	border-radius: 10px;
	display: flex;
	height: 100%;
	flex: 1;
	min-height: 0;
	overflow: hidden;
`

export default function DashboardLayout({ children }) {
	const { getRooms } = useContext(RoomsContext)
	const [showMonitor, setShowMonitor] = useState(false)

	useEffect(() => {
		getRooms();
		
		// Load WebSocket diagnostics in development
		if (process.env.NODE_ENV === 'development') {
			import('@/utils/websocketDiagnostics').then(() => {
				// WebSocket diagnostics loaded silently
			}).catch(err => {
				// Failed to load WebSocket diagnostics
			});
		}
		
		// Activar monitor con Ctrl+Shift+M
		const handleKeyPress = (e) => {
			if (e.ctrlKey && e.shiftKey && e.key === 'M') {
				setShowMonitor(prev => !prev);
			}
		};
		
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [getRooms])

	return (
		<div
			style={{
				background: theme.dark.background.primary,
				padding: '10px',
				height: '100%',
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				flex: 1,
			}}
		>
			<BodyComponent>
				<Toastbox />
				<LeftMenuBar />
				<MiddleMenu />
				<Suspense>{children}</Suspense>
			</BodyComponent>
			{showMonitor && process.env.NODE_ENV === 'development' && <WebSocketMonitor />}
		</div>
	)
}
