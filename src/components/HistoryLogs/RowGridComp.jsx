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

const RowGridComp = ({ color, data, type }) => {
	const operation =
		data.operation.charAt(0).toUpperCase() + data.operation.slice(1);
	const date = new Date(data.date);
	const name =
		type === 'room' ? data.room_name : data.operationDetails.target_username;
	const username = data.username;

	return (
		<RowGrid
			color={theme.dark.colors[color]}
			onClick={
				type === 'room'
					? () => sweetAlertbasic(data)
					: data.operation === 'edit'
					? () => sweetAlertbasic(data, 'users')
					: () => {}
			}
		>
			<ChildGrid_1>
				<GridCell>
					<ActionTitle color={theme.dark.colors[color]}>
						{operation}:
					</ActionTitle>
					<RoomTitle>{name}</RoomTitle>
				</GridCell>
			</ChildGrid_1>
			<ChildGrid_2>
				<DateCellContent>{date.toString()}</DateCellContent>
			</ChildGrid_2>
			<ChildGrid_3>
				<h6 style={{ textAlign: 'center' }}>{username}</h6>
			</ChildGrid_3>
		</RowGrid>
	);
};

export default RowGridComp;
