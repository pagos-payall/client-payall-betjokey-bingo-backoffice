import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { closeIcon } from '@/data/icons'
import { BoxTable } from '../styled/HistoryLogsComps'
import SubHeaderBar from '../SubHeaderBar'
import TableHeader from './TableHeader'
import FilterBox from './FilterBox'
import LoadingCircle from '../LoadingCircle'
import RowGridComp from './RowGridComp'
import NoInfoComp from '../NoInfoComp'
import { Container } from '../styled/DisplayLayouts'
import { useDebounce } from '@/services/useDebouncedValue'
import useFetch from '@/hooks/useFetch'

const HistoryLogsTable = ({ logsUri, type, origin }) => {
	const [loading, setLoading] = useState(true)
	const [historyData, setHistoryData] = useState([])
	const [valuesForm, setValuesForm] = useState({})
	const debouncedSearchTerm = useDebounce(valuesForm)
	const { fetchAPICall } = useFetch()
	const router = useRouter()
	const defaultConfig = {
		searchBar: '',
		create: false,
		delete: false,
		edit: false,
		archive: false,
		active: false,
		disable: false,
		date_i: '',
		time_i: '00:00',
		date_f: '',
		time_f: '23:59',
	}
	const rowColor = {
		delete: 'red',
		create: 'green',
		active: 'green',
		archive: 'yellow',
		unarchive: 'yellow',
		edit: 'purple',
		disable: 'purple',
		white: '',
	}

	const fieldHandleChange = (e) => {
		setLoading(true)

		setValuesForm((oldValues) => ({
			...oldValues,
			[e.target.name]:
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
		}))
	}

	useEffect(() => {
		if (Object.keys(debouncedSearchTerm).length !== 0) {
			fetchAPICall(logsUri, 'get', debouncedSearchTerm).then((data) => {
				setHistoryData(data.result.reverse())
			})
			setLoading(false)
		} else setValuesForm(defaultConfig)
	}, [debouncedSearchTerm])

	return (
		<Container>
			<SubHeaderBar
				tag='h2'
				icon={closeIcon}
				size={20}
				onClick={() => router.push(origin)}
			>
				Historial de Cambios
			</SubHeaderBar>
			<FilterBox
				initialValues={defaultConfig}
				fieldHandleChange={fieldHandleChange}
				cleanAllFields={() => setValuesForm(defaultConfig)}
				type={type}
			/>
			<BoxTable>
				<TableHeader col1='Operation' col2='Fecha' col3='Usuario' />
				{/* body */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '5px',
						flexGrow: '1',
						overflowY: 'auto',
					}}
				>
					{loading ? (
						<LoadingCircle size={100} />
					) : historyData.length > 0 ? (
						historyData.map((data, key) => (
							<RowGridComp
								data={data}
								color={rowColor[data.operation || undefined]}
								type={type}
								key={key}
							/>
						))
					) : (
						<NoInfoComp content='No existe registros' />
					)}
				</div>
			</BoxTable>
		</Container>
	)
}

export default HistoryLogsTable
