import styled from 'styled-components';
import { theme } from '../data/themes';
import Image from 'next/image';

const StyledButton = styled.button`
	background: transparent;
	color: white;
	font-weight: bold;

	padding: 10px 20px;
	border: 1px solid
		${(props) => (props.color ? theme.dark.colors[props.color] : 'white')};
	border-radius: 10px;
	width: 100%;
	letter-spacing: 1px;
	gap: 2.35px;

	align-items: center;
	text-align: center;
	display: flex;
	justify-content: center;
	transition: 0.25s ease-in-out;

	&:hover {
		background: ${(props) =>
			props.color ? theme.dark.colors[props.color] : 'white'};
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.6);
		color: ${(props) => (!props.color ? 'black' : 'white')};
		div {
			filter: invert(0);
		}
	}
`;

const ImageContainer = styled.div`
	filter: ${(props) =>
		props.color ? theme.dark.filters[props.color] : 'invert(100%)'};
	display: flex;
	align-items: center;
	transition: 0.25s ease-in-out;
`;

const Button = ({ children, icoUrl, ...props }) => (
	<StyledButton {...props}>
		{children}
		<ImageContainer>
			<Image src={icoUrl} alt={'ico'} width={20} height={20} />
		</ImageContainer>
	</StyledButton>
);

export default Button;
