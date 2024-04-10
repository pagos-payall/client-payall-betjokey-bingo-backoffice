import { theme } from '@/data/themes';
import styled from 'styled-components';

export const GridDisplay = styled.div`
	margin-top: 10px;
	display: grid;
	grid-template-columns: 0.5fr 0.75fr 0.5fr;
	grid-template-rows: 0.25fr 1.37fr 1.375fr;
	grid-column-gap: 15px;
	grid-row-gap: 5px;
	border: 1px solid ${theme.dark.borders.secundary};
	border-radius: 10px;
	padding: 10px;
`;

export const Grid1 = styled.div`
	grid-area: 1/1/2/2;
	display: flex;
`;
export const Grid2 = styled.div`
	grid-area: 2/1/3/2;
	display: flex;
`;
export const Grid3 = styled.div`
	grid-area: 3/1/4/2;
	display: flex;
`;
export const Grid4 = styled.div`
	grid-area: 1/2/2/3;
	display: flex;
`;
export const Grid5 = styled.div`
	grid-area: 2/2/3/3;
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	gap: 10px;
`;
export const Grid6 = styled.div`
	grid-area: 3/2/4/3;
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	gap: 10px;
`;
export const Grid7 = styled.div`
	grid-area: 1/3/2/4;
	display: flex;
`;
export const Grid8 = styled.div`
	grid-area: 2/3/3/4;
	display: flex;
`;
export const Grid9 = styled.div`
	grid-area: 3/3/4/4;
	display: flex;
`;
