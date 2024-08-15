import styled from 'styled-components';
import { theme } from '@/data/themes';

export const MenuComponent = styled.div`
	display: flex;
	flex-direction: column;
	background-color: transparent;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	width: 60px;
	max-width: 60px;
	min-width: 60px;
	border-right: 2px solid;
	border-color: ${theme.dark.borders.primary};
	border-radius: 10px 0 0px 10px;
	padding: 20px 0;
`;

export const UserHeaderComp = styled.div`
	width: 45px;
	height: 45px;
	background: ${theme.dark.background.secundary};
	border-radius: 50%;
	color: ${theme.dark.fonts.title_headers};
	font-weight: bold;
	margin-bottom: 5px;
	letter-spacing: 1.5px;
	text-transform: uppercase;
	display: flex;
	justify-content: space-around;
	align-items: center;
	text-align: center;
	font-size: 0.8em;
	transition: 0.35s;
	cursor: pointer;

	&:hover {
		filter: invert(100%);
		box-shadow: 0px 0px 10px 10px rgba(255, 255, 255, 0.45);
		-webkit-box-shadow: 0px 0px 10px 10px rgba(255, 255, 255, 0.45);
		-moz-box-shadow: 0px 0px 10px 10px rgba(255, 255, 255, 0.45);
	}
`;
