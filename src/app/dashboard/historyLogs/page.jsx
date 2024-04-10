'use client';
import { useState, useEffect } from 'react';
import { Formik } from 'formik';
import { InputSearchBar } from '@/components/SearchBar';
import SubHeaderBar from '@/components/SubHeaderBar';
import { closeIcon } from '@/data/icons';
import { theme } from '@/data/themes';
import FormikInputValue from '@/components/FormikInputValue';
import {
	BoxTable,
	ActionTitle,
	RowGridHeader,
	ChildGrid_1,
	ChildGrid_2,
	ChildGrid_3,
	GridCell,
} from '@/components/styled/HistoryLogsComps';
import fetchAPICall from '@/services/fetchAPICall';
import { useDebounce } from '@/services/useDebouncedValue';
import LoadingCircle from '@/components/LoadingCircle';
import NoInfoComp from '@/components/NoInfoComp';
import RowGridComp from '@/components/HistoryLogs/RowGridComp';
import { useRouter } from 'next/navigation';

export default function HistoryLogs() {
	const router = useRouter();
	const defaultConfig = {
		searchBar: '',
		create: false,
		delete: false,
		edit: false,
		archive: false,
		date_i: '',
		time_i: '00:00',
		date_f: '',
		time_f: '23:59',
	};
	const rowColor = {
		delete: 'red',
		create: 'green',
		archive: 'yellow',
		unarchive: 'yellow',
		edit: 'purple',
		white: '',
	};
	const [loading, setLoading] = useState(true);
	const [valuesForm, setValuesForm] = useState({});
	const debouncedSearchTerm = useDebounce(valuesForm);
	const [historyData, setHistoryData] = useState([]);

	const fieldHandleChange = (handleChange, values, e) => {
		setLoading(true);
		handleChange(e);

		e.target.type === 'checkbox'
			? (values[e.target.name] = e.target.value !== 'true')
			: (values[e.target.name] = e.target.value);

		setValuesForm(values);
	};

	useEffect(() => {
		if (Object.keys(debouncedSearchTerm).length === 0)
			setValuesForm(defaultConfig);
		else
			fetchAPICall('bingo/rooms/historyLogs', 'get', debouncedSearchTerm).then(
				(data) => {
					setHistoryData(data.result.reverse());
					setLoading(false);
				}
			);
	}, [debouncedSearchTerm]);
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				padding: '10px',
				gap: '10px',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			<SubHeaderBar
				tag='h2'
				icon={closeIcon}
				size={20}
				onClick={() => router.push('/dashboard')}
			>
				Historial de Cambios
			</SubHeaderBar>
			<div className='filterbox'>
				<Formik
					initialValues={defaultConfig}
					onSubmit={async (values) => {
						console.log(values);
					}}
				>
					{({ handleSubmit, handleChange, values, setFieldValue }) => (
						<form
							style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
							onSubmit={handleSubmit}
						>
							<InputSearchBar
								placeholder='Usuarios o salas'
								name='searchBar'
								type='text'
								onChange={(e) => fieldHandleChange(handleChange, values, e)}
							/>
							<h5 style={{ color: theme.dark.fonts.subHeaders_text }}>
								Filtrar por:
							</h5>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
								<FormikInputValue
									size={2}
									title='Create'
									type='checkbox'
									name='create'
									onChange={(e) => fieldHandleChange(handleChange, values, e)}
								/>
								<FormikInputValue
									size={2}
									title='Delete'
									type='checkbox'
									name='delete'
									onChange={(e) => fieldHandleChange(handleChange, values, e)}
								/>
								<FormikInputValue
									size={2}
									title='Edited'
									type='checkbox'
									name='edit'
									onChange={(e) => fieldHandleChange(handleChange, values, e)}
								/>
								<FormikInputValue
									size={2}
									title='archive/unarchive'
									type='checkbox'
									name='archive'
									onChange={(e) => fieldHandleChange(handleChange, values, e)}
								/>
								<FormikInputValue
									size={2}
									title='Fecha inicial'
									type='date'
									name='date_i'
									onChange={(e) => {
										fieldHandleChange(handleChange, values, e);
										if (e.target.value === '')
											setFieldValue('time_i', defaultConfig.time_i);
									}}
								/>
								<FormikInputValue
									size={2}
									title='Fecha final'
									type='date'
									name='date_f'
									onChange={(e) => {
										fieldHandleChange(handleChange, values, e);
										if (e.target.value === '')
											setFieldValue('time_f', defaultConfig.time_f);
									}}
								/>
								<FormikInputValue
									size={2}
									title='Hora inicial'
									type='time'
									name='time_i'
									onChange={(e) => fieldHandleChange(handleChange, values, e)}
									readOnly={values.date_i === ''}
								/>
								<FormikInputValue
									size={2}
									title='Hora final'
									type='time'
									name='time_f'
									onChange={(e) => fieldHandleChange(handleChange, values, e)}
									readOnly={values.date_f === ''}
								/>

								{/* <button type='submit'>Enviar</button> */}
							</div>
						</form>
					)}
				</Formik>
			</div>
			<BoxTable>
				{/* header */}
				<RowGridHeader>
					<ChildGrid_1>
						<GridCell>
							<ActionTitle>Operation</ActionTitle>
						</GridCell>
					</ChildGrid_1>
					<ChildGrid_2>
						<GridCell>
							<ActionTitle>Fecha</ActionTitle>
						</GridCell>
					</ChildGrid_2>
					<ChildGrid_3>
						<GridCell>
							<ActionTitle>Usuario</ActionTitle>
						</GridCell>
					</ChildGrid_3>
				</RowGridHeader>
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
						historyData.map((data) => (
							<RowGridComp
								data={data}
								color={rowColor[data.operation || undefined]}
							/>
						))
					) : (
						<NoInfoComp content='No existe registros' />
					)}
				</div>
			</BoxTable>
		</div>
	);
}
