'use client';
import HistoryLogsTable from '@/components/HistoryLogs';

export default function HistoryLog() {
	return (
		<HistoryLogsTable
			logsUri='/backOffice/logs'
			type='user'
			origin='/usersManagerView'
		/>
	);
}
