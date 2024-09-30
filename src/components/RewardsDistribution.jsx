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
	Grid7,
	Grid8,
	Grid9,
} from './styled/RewardsStyledComps'

const RewardsDistribution = ({ values, setFieldValue, handleChange }) => (
	<div style={{ width: '100%' }}>
		<SubHeaderBar tag='h4'>Distribución de Premios</SubHeaderBar>
		<GridDisplay>
			<Grid1
				style={{
					justifyContent: 'center',
				}}
			>
				<SubHeaderBar tag='h5'>Metodo</SubHeaderBar>
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
					onChange={(e) => {
						handleChange(e)
						if (e.target.value === 'true') {
							setFieldValue('porcen_premio_asignado_linea', 100)
							setFieldValue('porcen_premio_asignado_carton', 0)
						}
					}}
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
					onChange={(e) => {
						handleChange(e)
						if (e.target.value === 'true') {
							setFieldValue('porcen_premio_asignado_carton', 100)
							setFieldValue('porcen_premio_asignado_linea', 0)
						}
					}}
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
					disabled={!values.carton_full ? true : false}
					onChange={() => {
						if (values.linea_full)
							(e) => {
								handleChange(e)
								setFieldValue(
									'porcen_premio_asignado_linea',
									100 - e.target.value
								)
							}
					}}
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
					disabled={!values.linea_full ? true : false}
					onChange={() => {
						if (values.carton_full)
							(e) => {
								handleChange(e)
								setFieldValue(
									'porcen_premio_asignado_carton',
									100 - e.target.value
								)
							}
					}}
				/>
				<p style={{ color: theme.dark.fonts.subHeaders_text }}>
					{values.porcen_premio_asignado_linea}
				</p>
			</Grid6>
			<Grid7
				style={{
					justifyContent: 'center',
				}}
			>
				<SubHeaderBar tag='h5'>Cantidad de Unidades premidas</SubHeaderBar>
			</Grid7>
			<Grid8
				style={{
					justifyContent: 'center',
				}}
			>
				<FormikInputValue
					size={1}
					type='number'
					min={0}
					name='cant_cartones_premiados'
				/>
			</Grid8>
			<Grid9
				style={{
					justifyContent: 'center',
				}}
			>
				<FormikInputValue
					size={1}
					type='number'
					min={0}
					name='cant_lineas_premiadas'
				/>
			</Grid9>
		</GridDisplay>
	</div>
)

export default RewardsDistribution
