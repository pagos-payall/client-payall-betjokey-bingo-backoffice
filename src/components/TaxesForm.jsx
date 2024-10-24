import FormikInputValue from './FormikInputValue'
import Button from './Button'
import { addIcon, deleteIcon } from '@/data/icons'
import SubHeaderBar from './SubHeaderBar'
import { FieldArray } from 'formik'
import {
	StyledFlex,
	StyledGrid,
	GridChild_1,
	GridChild_2,
} from './styled/TaxesStyledComps'
import { validateNoLeftZero } from '@/services/utilFunctions'

const TaxesForm = ({ values, updateView, updateMode }) => {
	return (
		<FieldArray
			name='taxes'
			render={(arrayHelpers) => (
				<StyledFlex>
					<StyledGrid>
						<GridChild_1>
							<SubHeaderBar tag='h4'>Impuesto aplicados a premios</SubHeaderBar>
							<p>Los impuestos retenidos son retenciones a los premios</p>
						</GridChild_1>
						<GridChild_2>
							{updateView ? (
								updateMode && (
									<Button
										color='yellow'
										type='button'
										icoUrl={addIcon}
										onClick={() => arrayHelpers.push({ name: '', value: 0 })}
									>
										Agregar
									</Button>
								)
							) : (
								<Button
									color='yellow'
									type='button'
									icoUrl={addIcon}
									onClick={() => arrayHelpers.push({ name: '', value: 0 })}
								>
									Agregar
								</Button>
							)}
						</GridChild_2>
					</StyledGrid>
					{values.taxes &&
						values.taxes.length > 0 &&
						values.taxes.map((tax, index) => (
							<StyledGrid key={index}>
								<GridChild_1>
									<FormikInputValue
										placeholder='Nombre del Inpuesto'
										type='text'
										name={`taxes.${index}.name`}
										title='Nombre'
										size={2}
										design={2}
										readOnly={updateView ? !updateMode : false}
									/>
									<FormikInputValue
										placeholder='Valor'
										type='text'
										$inputType='number'
										name={`taxes.${index}.value`}
										title='Valor'
										isAllowed={({ floatValue, value }) =>
											(floatValue || 0) <= 100 && validateNoLeftZero(value)
										}
										size={3}
										design={2}
										simbol='%'
										readOnly={updateView ? !updateMode : false}
									/>
								</GridChild_1>
								<GridChild_2>
									{updateView ? (
										updateMode && (
											<Button
												color='red'
												type='button'
												icoUrl={deleteIcon}
												onClick={() => arrayHelpers.remove(index)}
											/>
										)
									) : (
										<Button
											color='red'
											type='button'
											icoUrl={deleteIcon}
											onClick={() => arrayHelpers.remove(index)}
										/>
									)}
								</GridChild_2>
							</StyledGrid>
						))}
				</StyledFlex>
			)}
		/>
	)
}

export default TaxesForm
