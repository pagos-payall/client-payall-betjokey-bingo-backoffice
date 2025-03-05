// components/dashboard/shared/ErrorState.jsx
'use client';
import styled from 'styled-components';
import { theme } from '@/data/themes';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px;
	background-color: ${theme.dark.background.primary};
	border-radius: 8px;
	border: 1px solid ${theme.dark.error};
	margin-bottom: 20px;
`;

const Icon = styled.div`
	font-size: 24px;
	color: ${theme.dark.error};
	margin-bottom: 10px;
`;

const Message = styled.p`
	color: ${theme.dark.text.primary};
	font-size: 16px;
	margin: 0 0 10px 0;
	text-align: center;
`;

const Details = styled.p`
	color: ${theme.dark.text.secondary};
	font-size: 14px;
	margin: 0;
	text-align: center;
`;

const RetryButton = styled.button`
	background-color: ${theme.dark.background.accent};
	color: ${theme.dark.text.alternative};
	border: none;
	border-radius: 4px;
	padding: 8px 16px;
	margin-top: 15px;
	cursor: pointer;
	font-weight: bold;
	transition: all 0.3s ease;

	&:hover {
		background-color: ${theme.dark.background.hover};
		color: ${theme.dark.text.accent};
	}
`;

const ErrorState = ({
	message = 'Error al cargar los datos',
	details,
	onRetry,
}) => {
	return (
		<Container>
			<Icon>⚠️</Icon>
			<Message>{message}</Message>
			{details && <Details>{details}</Details>}
			{onRetry && (
				<RetryButton onClick={onRetry}>Intentar nuevamente</RetryButton>
			)}
		</Container>
	);
};

export default ErrorState;
