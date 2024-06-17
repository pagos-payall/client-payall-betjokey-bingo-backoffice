import styled from 'styled-components';
import { theme } from '@/data/themes';

export const BoxTable = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	gap: 5px;
	overflow-y: auto;
	height: 100%;
`;

export const ActionTitle = styled.h5`
	color: ${(props) => props.color || theme.dark.fonts.title_headers};
	transition: 0.2s ease-out;
`;
export const RowGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: 1fr;
	grid-column-gap: 0px;
	grid-row-gap: 0px;

	border: 1px solid #fff;
	border-color: ${(props) => props.color || '#fff'};
	border-radius: 10px;
	color: ${(props) => props.textColor || theme.dark.fonts.title_headers};
	padding: 10px;
	transition: 0.2s ease-out;

	&:hover {
		background: ${(props) => props.color || '#fff'};
	}
	&:hover ${ActionTitle} {
		color: #222;
	}
`;

export const RowGridHeader = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: 1fr;
	grid-column-gap: 0px;
	grid-row-gap: 0px;

	border: 1px solid #fff;
	border-color: '#fff';
	border-radius: 10px;
	color: ${theme.dark.fonts.title_headers};
	background: ${theme.dark.background.secundary};
	padding: 10px;
`;

export const ChildGrid_1 = styled.div`
	grid-area: 1 / 1 / 2 / 2;
	display: flex;
	justify-content: flex-start;
	align-items: center;
`;
export const ChildGrid_2 = styled.div`
	grid-area: 1 / 2 / 2 / 3;
	display: flex;
	justify-content: space-around;
	align-items: center;
`;
export const ChildGrid_3 = styled.div`
	grid-area: 1 / 3 / 2 / 4;
	display: flex;
	justify-content: space-around;
	align-items: center;
`;

export const RoomTitle = styled.h5`
	font-weight: 500;
`;

export const DateCellContent = styled.h5`
	font-weight: 300;
	margin: auto;
`;

export const GridCell = styled.div`
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	gap: 5px;
`;
