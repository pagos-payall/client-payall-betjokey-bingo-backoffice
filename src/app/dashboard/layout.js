'use client';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import LeftMenuBar from '@/components/LeftMenuBar';
import MiddleMenu from '@/components/dashboard/middleMenu';
import Toastbox from '@/components/ToastBox';
import { useContext, useEffect } from 'react';
import RoomsContext from '@/context/rooms/RoomsContext';

const BodyComponent = styled.div`
	border: 2px solid;
	border-color: ${theme.dark.borders.primary};
	border-radius: 10px;
	display: flex;
	height: 100%;
`;

export default function DashboardLayout({ children }) {
	const { getRooms } = useContext(RoomsContext);
	useEffect(()=>{
		getRooms()
	},[])
	return (
		<div
			style={{
				background: theme.dark.background.primary,
				padding: '10px',
				height: '100%',
			}}
		>
			<BodyComponent>
				<Toastbox />
				<LeftMenuBar />
				<MiddleMenu />
				{children}
			</BodyComponent>
		</div>
	);
}
