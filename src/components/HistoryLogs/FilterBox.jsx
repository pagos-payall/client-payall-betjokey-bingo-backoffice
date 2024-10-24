import { Formik } from 'formik'
import { theme } from '@/data/themes'
import FormikInputValue from '../FormikInputValue'
import { InputSearchBar } from '../SearchBar'
import Button from '../Button'

const FilterBox = ({
	fieldHandleChange,
	cleanAllFields,
	initialValues,
	type,
}) => {
	return (
		<div>
			<Formik initialValues={initialValues}>
				{({ handleChange, values, setFieldValue, resetForm }) => (
					<form
						style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
					>
						{}
						<InputSearchBar
							placeholder='Usuarios o salas'
							name='searchBar'
							type='text'
							$inputType='text'
							onChange={(e) => {
								handleChange(e)
								fieldHandleChange(e)
							}}
						/>
						<h5 style={{ color: theme.dark.fonts.subHeaders_text }}>
							Filtrar por:
						</h5>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
							<FormikInputValue
								size={2}
								title='Crear'
								type='checkbox'
								$inputType='checkbox'
								name='create'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
								}}
							/>
							<FormikInputValue
								size={2}
								title='Borrar'
								$inputType='checkbox'
								type='checkbox'
								name='delete'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
								}}
							/>
							<FormikInputValue
								size={2}
								title='Editar'
								$inputType='checkbox'
								type='checkbox'
								name='edit'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
								}}
							/>
							<FormikInputValue
								size={2}
								title='Archivar/Desarchivar'
								$inputType='checkbox'
								type='checkbox'
								name='archive'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
								}}
							/>
							{type === 'user' && (
								<>
									<FormikInputValue
										size={2}
										title='Activar'
										$inputType='checkbox'
										type='checkbox'
										name='active'
										onChange={(e) => {
											handleChange(e)
											fieldHandleChange(e)
										}}
									/>
									<FormikInputValue
										size={2}
										title='Desactivar'
										$inputType='checkbox'
										type='checkbox'
										name='disable'
										onChange={(e) => {
											handleChange(e)
											fieldHandleChange(e)
										}}
									/>
								</>
							)}
							<FormikInputValue
								size={2}
								title='Fecha inicial'
								$inputType='date'
								type='date'
								name='date_i'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
									if (e.target.value === '')
										setFieldValue('time_i', initialValues.time_i)
								}}
							/>
							<FormikInputValue
								size={2}
								title='Fecha final'
								$inputType='date'
								type='date'
								name='date_f'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
									if (e.target.value === '')
										setFieldValue('time_f', initialValues.time_f)
								}}
							/>
							<FormikInputValue
								size={2}
								title='Hora inicial'
								$inputType='time'
								type='time'
								name='time_i'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
								}}
								readOnly={values.date_i === ''}
							/>
							<FormikInputValue
								size={2}
								title='Hora final'
								type='time'
								$inputType='time'
								name='time_f'
								onChange={(e) => {
									handleChange(e)
									fieldHandleChange(e)
								}}
								readOnly={values.date_f === ''}
							/>
							<Button
								type='button'
								color='yellow'
								onClick={() => {
									cleanAllFields()
									resetForm()
								}}
							>
								Limpiar filtros
							</Button>
						</div>
					</form>
				)}
			</Formik>
		</div>
	)
}

export default FilterBox
