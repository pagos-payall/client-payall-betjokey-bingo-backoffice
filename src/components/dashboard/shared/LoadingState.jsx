// components/dashboard/shared/LoadingState.jsx
'use client';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/data/themes';

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: ${(props) => props.height || '200px'};
	width: 100%;
`;

const Spinner = styled.div`
	border: 4px solid rgba(0, 0, 0, 0.1);
	border-left-color: ${theme.dark.text.accent};
	border-radius: 50%;
	width: 30px;
	height: 30px;
	animation: spin 1s linear infinite;
	margin-bottom: 10px;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

const Message = styled.p`
	color: ${theme.dark.text.secondary};
	font-size: 14px;
	margin: 0;
`;

const Skeleton = styled.div`
	width: ${(props) => props.width || '100%'};
	height: ${(props) => props.height || '20px'};
	background-color: ${theme.dark.background.hover};
	border-radius: 4px;
	margin-bottom: ${(props) => props.mb || '10px'};
	animation: ${pulse} 1.5s infinite;
`;

const SkeletonContainer = styled.div`
	width: 100%;
	padding: ${(props) => props.padding || '0'};
`;

const LoadingState = ({
	type = 'spinner',
	height,
	message = 'Cargando datos...',
}) => {
	if (type === 'spinner') {
		return (
			<Container height={height}>
				<Spinner />
				<Message>{message}</Message>
			</Container>
		);
	}

	if (type === 'skeleton') {
		return (
			<SkeletonContainer padding={height}>
				<Skeleton mb='15px' height='30px' />
				<Skeleton mb='15px' />
				<Skeleton mb='15px' />
				<Skeleton height='200px' />
			</SkeletonContainer>
		);
	}

	return (
		<Container height={height}>
			<Message>{message}</Message>
		</Container>
	);
};

export default LoadingState;
