import FormikInputValue from './FormikInputValue'
import SubHeaderBar from './SubHeaderBar'
import { theme } from '@/data/themes'
import {
	GridDisplay,
	Grid1,
	Grid2,
	Grid3,
	Grid4,
	Grid5,
	Grid6,
} from './styled/RewardsStyledComps'
import { useEffect, useState } from 'react'

const RewardsDistribution = ({
	values,
	setFieldValue,
	handleChange,
	setError,
}) => {
	const [fieldValues, setFieldValues] = useState({
		carton_full: true,
		linea_full: true,
	})
	const [rangeValues, setRangeValues] = useState({
		carton_full: true,
		linea_full: true,
	})

	function handleCheckChange(e) {
		handleChange(e)
		setFieldValues((oldValue) => ({
			...oldValue,
			[e.target.name]: e.target.checked,
		}))
	}

	function handleRangeChange(e) {
		const otherInput =
			e.target.name === 'porcen_premio_asignado_carton'
				? 'porcen_premio_asignado_linea'
				: 'porcen_premio_asignado_carton'
		if (fieldValues.carton_full && fieldValues.linea_full) {
			handleChange(e)
			setFieldValue(otherInput, 100 - e.target.value)
			setRangeValues((oldValue) => ({
				...oldValue,
				[e.target.name]: e.target.value,
			}))
		}
	}

	function validateRangeField() {
		if (fieldValues.carton_full && fieldValues.linea_full) {
			if (
				values.porcen_premio_asignado_carton === 0 ||
				values.porcen_premio_asignado_linea === 0
			) {
				setError({
					error:
						'El valor de premio asignado a todas las opciones debe ser mayor 0',
					bool: true,
				})
			} else
				setError({
					error: undefined,
					bool: false,
				})
		}
	}

	useEffect(() => {
		setFieldValues({
			carton_full: values.carton_full,
			linea_full: values.linea_full,
		})
	}, [])

	useEffect(() => {
		const { carton_full, linea_full } = fieldValues
		const valueCarton = carton_full ? 100 : 0
		const valueLinea = linea_full ? 100 : 0

		if (!carton_full || !linea_full) {
			setFieldValue('porcen_premio_asignado_carton', valueCarton)
			setFieldValue('porcen_premio_asignado_linea', valueLinea)
		}

		if (!carton_full && !linea_full)
			setError({
				error: 'Debes seleccionar por lo menos una opcion de premios',
				bool: true,
			})
		else {
			setError({
				error: undefined,
				bool: false,
			})
			validateRangeField()
		}
	}, [fieldValues])

	useEffect(() => {
		validateRangeField()
	}, [rangeValues])

	return (
		<div style={{ width: '100%' }}>
			<SubHeaderBar tag='h4'>Distribución de Premios</SubHeaderBar>
			<GridDisplay>
				<Grid1
					style={{
						justifyContent: 'center',
					}}
				>
					<SubHeaderBar tag='h5'>Método</SubHeaderBar>
				</Grid1>
				<Grid2
					style={{
						justifyContent: 'flex-start',
					}}
				>
					<FormikInputValue
						size={1}
						title='Carton completo'
						type='checkbox'
						name='carton_full'
						onChange={(e) => handleCheckChange(e, 100, 0)}
					/>
				</Grid2>
				<Grid3
					style={{
						justifyContent: 'flex-start',
					}}
				>
					<FormikInputValue
						size={1}
						title='Lineas'
						type='checkbox'
						name='linea_full'
						onChange={(e) => handleCheckChange(e, 0, 100)}
					/>
				</Grid3>
				<Grid4
					style={{
						justifyContent: 'center',
					}}
				>
					<SubHeaderBar tag='h5'>Porcentaje del premio asignado</SubHeaderBar>
				</Grid4>
				<Grid5>
					<FormikInputValue
						size={1}
						type='range'
						min='0'
						max='100'
						name='porcen_premio_asignado_carton'
						disabled={
							fieldValues.carton_full && fieldValues.linea_full ? false : true
						}
						onChange={handleRangeChange}
					/>
					<p style={{ color: theme.dark.fonts.subHeaders_text }}>
						{values.porcen_premio_asignado_carton}
					</p>
				</Grid5>
				<Grid6>
					<FormikInputValue
						size={1}
						type='range'
						min='0'
						max='100'
						name='porcen_premio_asignado_linea'
						disabled={
							fieldValues.carton_full && fieldValues.linea_full ? false : true
						}
						onChange={handleRangeChange}
					/>
					<p style={{ color: theme.dark.fonts.subHeaders_text }}>
						{values.porcen_premio_asignado_linea}
					</p>
				</Grid6>
			</GridDisplay>
		</div>
	)
}

export default RewardsDistribution
