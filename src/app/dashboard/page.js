'use client';
import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';

import FinancialPanel from '@/components/dashboard/FinanceMetrics';
import RoomPerformancePanel from '@/components/dashboard/RoomsPerformance';
import SystemStatusPanel from '@/components/dashboard/SystemMetrics';
import UserMetricsPanel from '@/components/dashboard/UsersMetrics';
import GameAnalyticsPanel from '@/components/dashboard/GameMetrics';
import RoomStatistics from '@/components/dashboard/RoomStatistics';

// Styled components
const DashboardContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	padding: 20px;
	overflow-y: auto;
	overflow-x: hidden;
	color: ${theme.dark.text.primary};
	background-color: ${theme.dark.background.secondary};
	flex: 1;
`;

const TabsContainer = styled.div`
	display: flex;
	margin-bottom: 20px;
	border-bottom: 1px solid ${theme.dark.borders.secondary};
`;

const TabButton = styled.button`
	padding: 10px 20px;
	margin-right: 10px;
	background-color: ${(props) =>
		props.$active ? theme.dark.background.accent : 'transparent'};
	color: ${(props) =>
		props.$active ? theme.dark.text.primary : theme.dark.text.secondary};
	border: none;
	border-bottom: 3px solid
		${(props) => (props.$active ? theme.dark.text.accent : 'transparent')};
	border-radius: 4px 4px 0 0;
	cursor: pointer;
	font-weight: ${(props) => (props.$active ? 'bold' : 'normal')};
	transition: all 0.3s ease;

	&:hover {
		background-color: ${theme.dark.background.hover};
		color: ${theme.dark.text.accent};
	}
`;

const PanelContainer = styled.div`
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	min-height: 0;
`;

export default function DashboardPage() {
	// State for active tab
	const [activeTab, setActiveTab] = useState('financial');
	// State for loading status
	const [isLoading, setIsLoading] = useState(false);

	// Tabs configuration
	const tabs = [
		{ id: 'financial', label: 'Finanzas' },
		{ id: 'rooms', label: 'Salas' },
		{ id: 'room-stats', label: 'Estadísticas de Salas' },
		{ id: 'users', label: 'Usuarios' },
		{ id: 'game', label: 'Análisis de Juego' },
		{ id: 'system', label: 'Estado del Sistema' },
	];

	// Helper function to render the active panel
	const renderActivePanel = () => {
		switch (activeTab) {
			case 'financial':
				return <FinancialPanel />;
			case 'rooms':
				return <RoomPerformancePanel />;
			case 'room-stats':
				return <RoomStatistics />;
			case 'users':
				return <UserMetricsPanel />;
			case 'game':
				return <GameAnalyticsPanel />;
			case 'system':
				return <SystemStatusPanel />;
			default:
				return <FinancialPanel />;
		}
	};

	return (
		<DashboardContainer>
			<h1 style={{ padding: '10px' }}>Betjockey Dashboard</h1>

			<TabsContainer>
				{tabs.map((tab) => (
					<TabButton
						key={tab.id}
						$active={activeTab === tab.id}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</TabButton>
				))}
			</TabsContainer>

			<PanelContainer>
				{isLoading ? <div>Cargando...</div> : renderActivePanel()}
			</PanelContainer>
		</DashboardContainer>
	);
}
