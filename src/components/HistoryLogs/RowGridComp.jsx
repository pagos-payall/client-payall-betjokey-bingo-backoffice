import { theme } from '@/data/themes'
import {
	ActionTitle,
	RowGrid,
	ChildGrid_1,
	ChildGrid_2,
	ChildGrid_3,
	RoomTitle,
	DateCellContent,
	GridCell,
} from '@/components/styled/HistoryLogsComps'
import { useState } from 'react'
import HistoryLogsModal from '../modals/HistoryLogsModal'

const RowGridComp = ({ color, data, type }) => {
	const [modalView, setModalView] = useState(false)
	const date = new Date(data.date)
	const username = data.username

	console.log(data)

	const operation =
		data.operation.charAt(0).toUpperCase() + data.operation.slice(1)
	const name =
		type === 'room' ? data.room_name : data.operationDetails.target_username

	return (
		<>
			{modalView && (
				<HistoryLogsModal setModalView={setModalView} data={data} type={type} />
			)}
			<RowGrid
				color={theme.dark.colors[color]}
				onClick={() => setModalView(true)}
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
		</>
	)
}

export default RowGridComp
