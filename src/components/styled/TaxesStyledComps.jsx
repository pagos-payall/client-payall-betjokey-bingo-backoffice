import styled from 'styled-components';
import { theme } from '@/data/themes';

export const StyledFlex = styled.div`
	background: ${theme.dark.background.primary};
	display: flex;
	flex-wrap: nowrap;
	flex-direction: column;
	justify-content: flex-start;
	gap: 0;
	border-radius: 10px;
	padding: 10px 0;
	width: 100%;
`;

export const StyledGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-auto-rows: auto
	grid-column-gap: 0px;
	grid-row-gap: 0px;
	padding: 10px;
	border-bottom: 1px solid ${theme.dark.borders.secundary};
`;

export const GridChild_1 = styled.div`
	grid-area: 1 / 1 / 2 / 4;
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const GridChild_2 = styled.div`
	display: flex;
	align-items: center;
	grid-area: 1 / 4 / 2 / 5;
`;
