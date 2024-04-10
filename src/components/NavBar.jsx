'use client';
import styled from 'styled-components';
import { theme } from '../data/themes';

const NavBarComponent = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background: ${theme.dark.background.secundary};
	color: white;
	padding: 10px 20px;
	height: 60px;
	border-radius: 20px;
	margin-bottom: 10px;
`;

const Title = styled.h1`
	font-size: 1.25rem;
	margin: auto;
	vertical-align: middle;
	width: auto;
	margin-left: 0;
`;

const NavBar = () => (
	<NavBarComponent>
		<Title>betjockey-admin</Title>
	</NavBarComponent>
);

export default NavBar;
