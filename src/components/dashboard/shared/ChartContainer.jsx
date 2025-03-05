// components/dashboard/shared/ChartContainer.jsx
'use client';
import styled from 'styled-components';
import { theme } from '@/data/themes';

const Container = styled.div`
	background-color: ${theme.dark.background.primary};
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
	height: ${(props) => props.height || 'auto'};
`;

const Title = styled.h3`
	font-size: 16px;
	font-weight: bold;
	color: ${theme.dark.text.primary};
	margin-top: 0;
	margin-bottom: 20px;
`;

const ChartContainer = ({ title, children, height }) => {
	return (
		<Container height={height}>
			{title && <Title>{title}</Title>}
			{children}
		</Container>
	);
};

export default ChartContainer;
