import styled from 'styled-components';
import { theme } from '@/data/themes';

const Title = styled.h1`
	color: ${theme.dark.fonts.title_headers};
	height: auto;
	text-align: center;
	padding: 0 20px;
	font-size: 1.82em;
`;

const LogoTitle = () => <Title>BetJockey - BackOffice</Title>;

export default LogoTitle;
