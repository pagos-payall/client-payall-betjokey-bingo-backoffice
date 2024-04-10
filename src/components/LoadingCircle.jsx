import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Loader = styled.div`
	display: inline-block;
	width: ${(props) => props.size + 'px' || '50px'};
	height: ${(props) => props.size + 'px' || '50px'};
	&:after {
		content: ' ';
		display: block;
		width: ${(props) => props.size + 'px' || '50px'};
		height: ${(props) => props.size + 'px' || '50px'};
		margin: 1px;
		border-radius: 50%;
		border: 6px solid;
		border-color: #fff transparent #fff transparent;
		animation: ${rotate} 1.5s linear infinite;
	}
`;

const LoadingCircle = (props) => {
	return (
		<div
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Loader {...props} />
		</div>
	);
};

export default LoadingCircle;
