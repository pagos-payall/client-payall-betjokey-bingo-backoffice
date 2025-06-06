'use client'
import styled from 'styled-components';
import LeftMenuBar from '@/components/LeftMenuBar';
import MiddleMenu from '@/components/MiddleMenu';
import { theme } from '@/data/themes';
import Toastbox from '@/components/ToastBox';

const BodyComponent = styled.div`
	border: 2px solid;
	border-color: ${theme.dark.borders.primary};
	border-radius: 10px;
	display: flex;
	height: 100%;
`;

export default function UserManagerViewLayout({ children }) {
	return (
		<div style={{
			background: theme.dark.background.primary,
			padding: '10px',
			height: '100%',
		}}>
				<BodyComponent>
					<Toastbox />
					<LeftMenuBar />
					<MiddleMenu />
					{children}
				</BodyComponent>
		</div>
	);
}