'use client'
import HistoryLogsTable from '@/components/HistoryLogs'

export default function HistoryLogs() {
	return (
		<HistoryLogsTable
			logsUri='bingo/rooms/historyLogs'
			type='room'
			origin='/dashboard/historyLog'
		/>
	)
}
