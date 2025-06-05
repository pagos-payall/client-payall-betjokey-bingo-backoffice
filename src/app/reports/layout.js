'use client';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import LeftMenuBar from '@/components/LeftMenuBar';
import Toastbox from '@/components/ToastBox';
import { Suspense } from 'react';

const BodyComponent = styled.div`
	border: 2px solid;
	border-color: ${theme.dark.borders.primary};
	border-radius: 10px;
	display: flex;
	height: 100%;
`;

export default function ReportsLayout({ children }) {
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
				<Suspense>{children}</Suspense>
			</BodyComponent>
		</div>
	);
}
