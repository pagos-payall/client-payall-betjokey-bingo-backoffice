import { Formik } from 'formik';
import { theme } from '@/data/themes';
import FormikInputValue from '../FormikInputValue';
import { InputSearchBar } from '../SearchBar';

const FilterBox = ({ fieldHandleChange, initialValues }) => (
	<div>
		<Formik initialValues={initialValues}>
			{({ handleChange, values, setFieldValue }) => (
				<form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
									setFieldValue('time_i', initialValues.time_i);
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
									setFieldValue('time_f', initialValues.time_f);
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
					</div>
				</form>
			)}
		</Formik>
	</div>
);

export default FilterBox;
