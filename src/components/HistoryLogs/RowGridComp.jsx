import { theme } from '@/data/themes';
import {
	ActionTitle,
	RowGrid,
	ChildGrid_1,
	ChildGrid_2,
	ChildGrid_3,
	RoomTitle,
	DateCellContent,
	GridCell,
} from '@/components/styled/HistoryLogsComps';
import sweetAlertbasic from './SweetAlert_basic';

const RowGridComp = ({ color, data }) => {
	const operation =
		data.operation.charAt(0).toUpperCase() + data.operation.slice(1);
	const date = new Date(data.date);

	return (
		<RowGrid
			color={theme.dark.colors[color]}
			onClick={() => sweetAlertbasic(data)}
		>
			<ChildGrid_1>
				<GridCell>
					<ActionTitle color={theme.dark.colors[color]}>
						{operation}:
					</ActionTitle>
					<RoomTitle>{data.room_name}</RoomTitle>
				</GridCell>
			</ChildGrid_1>
			<ChildGrid_2>
				<DateCellContent>{date.toString()}</DateCellContent>
			</ChildGrid_2>
			<ChildGrid_3>
				<h6 style={{ textAlign: 'center' }}>{data.username}</h6>
			</ChildGrid_3>
		</RowGrid>
	);
};

export default RowGridComp;
