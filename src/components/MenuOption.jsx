import styled from 'styled-components';
import Image from 'next/image';
import { theme } from '../data/themes';
import Link from 'next/link';

const MenuOptionStyled = styled.div`
	border-radius: 10px;
	width: 100px;
	height: 100px;
	background: ${theme.dark.background.secundary};
	padding: 5px;
	position: relative;
	min-width: 100px;
	transition: 0.35s;

	&:hover {
		filter: invert(15%);
	}
`;

const MenuOption = ({ title, icoUrl, path = '', onClick }) => (
	<Link href={path} onClick={onClick}>
		<MenuOptionStyled>
			<Image
				src={icoUrl}
				alt={'ico'}
				width={20}
				height={20}
				style={{
					filter: 'invert(100%)',
				}}
			/>
			<h3
				style={{
					position: 'absolute',
					textAlign: 'right',
					bottom: 5,
					right: 10,
					fontSize: '0.9em',
					color: theme.dark.fonts.subHeaders_text,
					wordBreak: 'break-word',
				}}
			>
				{title}
			</h3>
		</MenuOptionStyled>
	</Link>
);

export default MenuOption;
