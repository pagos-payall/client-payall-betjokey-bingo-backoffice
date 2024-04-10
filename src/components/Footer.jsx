'use client';
import styled from 'styled-components';

const FooterComponent = styled.footer`
	display: flex;
	flex-direction: row;
	justify-content: center;
	background: #005510;
	padding: 10px 20px;
	height: 50px;
`;

const Footer = () => (
	<FooterComponent>
		<h3>betjockey-footer</h3>
	</FooterComponent>
);

export default Footer;
