import {
	RowGridHeader,
	ChildGrid_1,
	ChildGrid_2,
	ChildGrid_3,
	GridCell,
	ActionTitle,
} from '../styled/HistoryLogsComps';

const TableHeader = ({ col1, col2, col3 }) => (
	<RowGridHeader>
		<ChildGrid_1>
			<GridCell>
				<ActionTitle>{col1}</ActionTitle>
			</GridCell>
		</ChildGrid_1>
		<ChildGrid_2>
			<GridCell>
				<ActionTitle>{col2}</ActionTitle>
			</GridCell>
		</ChildGrid_2>
		<ChildGrid_3>
			<GridCell>
				<ActionTitle>{col3}</ActionTitle>
			</GridCell>
		</ChildGrid_3>
	</RowGridHeader>
);

export default TableHeader;
