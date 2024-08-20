'use client'
import React, { useState, useEffect, useContext } from 'react'
import { Formik } from 'formik'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { theme } from '@/data/themes'
import { isEqual } from 'lodash'
import useFetch from '@/hooks/useFetch'
import Button from '@/components/Button'
import { addIcon, closeIcon, saveIcon } from '@/data/icons'
import { createRoomValidationSchema } from '@/validationSchemas/createRoom'
import FormikInputValue from '@/components/FormikInputValue'
import SubHeaderBar from '@/components/SubHeaderBar'
import LoadingCircle from '@/components/LoadingCircle'
import { isoShortDate } from '@/services/getISODate'
import UpdateFormHeader from '@/components/UpdateFormHeader'
import JuegoAsociado from '@/components/dashboard/JuegoAsociado'
import {
	FormDiv,
	FieldsContainer,
	FieldsPorcenContainer,
	PorcenSubHeader,
} from '@/components/styled/roomForm'
import TaxesForm from '@/components/TaxesForm'
import RoomsContext from '@/context/rooms/RoomsContext'
import RewardsDistribution from '@/components/RewardsDistribution'
import useUser from '@/hooks/useUser'

export default function RoomForm() {
	const { getRooms } = useContext(RoomsContext)
	const { username } = useUser()
	const { fetchAPICall } = useFetch()
	const router = useRouter()
	const searchParams = useSearchParams()
	const min_date = isoShortDate()
	const [initialValues, setInitialValues] = useState(null)
	const [updateView, setUpdateView] = useState(false)
	const [updateMode, setUpdateMode] = useState(false)
	const [salaData, setSalaData] = useState({
		room_id: '',
		status: '',
		createAt: '',
		ref: '',
	})
	let fields = {
		host_username: 'test',
		room_name: '',
		typeOfGame: '',
		card_price: '',
		comision: '',
		play: '',
		pote_especial: '',
		premios: '',
		min_value: '',
		taxes: [],
		carton_full: true,
		linea_full: true,
		porcen_premio_asignado_carton: 70,
		porcen_premio_asignado_linea: 30,
		cant_cartones_premiados: 1,
		cant_lineas_premiadas: 5,
	}

	function handleSubmit(values, setSubmitting, resetForm) {
		let method = 'post'
		const formValues = values

		if (values.beginsAtDate !== undefined) {
			let date = values.beginsAtDate.split('T')
			let hora = date[1].split(':')

			if (date[0] === min_date.split('T')[0] && +hora[0] < +hh)
				return toast.error('Ingrese una hora futura')
		}

		if (updateView) {
			const array = Object.entries(values)
			const obj = new Object()

			if (isEqual(values, initialValues))
				return toast.info('No se altero ningun valor de la sala')

			for (const val of array) {
				if (initialValues[val[0]] !== val[1]) obj[val[0]] = val[1]
			}
			values = obj
			values['room_id'] = salaData.room_id
			method = 'patch'
		}

		values['operatorName'] = username

		fetchAPICall('bingo/rooms', method, values).then(() => {
			setSubmitting(false)
			getRooms()
			if (!updateView) resetForm()
			else {
				delete values.room_id
				setUpdateMode(false)
				setInitialValues(formValues)
			}
		})
	}

	useEffect(() => {
		if (searchParams.size === 0) {
			setInitialValues(fields)
			setUpdateView(false)
		} else {
			for (const key of searchParams.keys()) {
				const data = JSON.parse(key)
				const array = Object.entries(data)

				array.forEach((entrie) => {
					const [key, value] = entrie

					if (Array.isArray(value)) {
						const obj = new Object()
						obj[key] = []

						value.forEach((entrie_2) => {
							const array_3 = Object.entries(entrie_2)
							const obj2 = new Object()

							array_3.forEach(([key_3, value_3]) => {
								obj2[key_3] = value_3
							})
							obj[key].push(obj2)
						})

						setInitialValues((oldValues) => ({ ...oldValues, ...obj }))
					}

					if (salaData[key] !== undefined) {
						const obj = new Object()
						obj[key] = value
						return setSalaData((oldValues) => ({ ...oldValues, ...obj }))
					}
					if (fields[key] === undefined && typeof value !== 'object') return
					if (typeof value === 'object') {
						const array_2 = Object.entries(value)

						return array_2.forEach((entrie_2) => {
							const [key_2, value_2] = entrie_2

							if (fields[key_2] === undefined) return
							else {
								const obj = new Object()
								obj[key_2] = value_2
								setInitialValues((oldValues) => ({ ...oldValues, ...obj }))
							}
						})
					}

					const obj = new Object()
					obj[key] = value
					setInitialValues((oldValues) => ({ ...oldValues, ...obj }))
					setUpdateView(true)
					setUpdateMode(false)
				})
			}
		}
	}, [searchParams])

	return (
		<>
			{!initialValues && searchParams.size > 0 ? (
				<LoadingCircle size={100} />
			) : (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '10px',
						padding: '20px 30px',
						width: '100%',
						overflowY: 'auto',
						height: '100%',
					}}
				>
					<SubHeaderBar
						tag='h2'
						icon={closeIcon}
						size={20}
						onClick={() => router.push('/dashboard')}
					>
						{!updateView ? (
							'Creación de Salas'
						) : (
							<UpdateFormHeader
								name={initialValues.room_name}
								codigo={salaData.room_id}
								status={salaData.status}
								updateMode={updateMode}
								setUpdateMode={setUpdateMode}
							/>
						)}
					</SubHeaderBar>
					<div
						style={{
							background: theme.dark.background.secundary,
							borderRadius: '10px',
						}}
					>
						<Formik
							key={
								initialValues &&
								JSON.stringify(
									initialValues.room_name +
										initialValues.host_username +
										updateMode
								)
							}
							validationSchema={createRoomValidationSchema}
							initialValues={{ ...initialValues }}
							onSubmit={async (values, { setSubmitting, resetForm }) => {
								handleSubmit(values, setSubmitting, resetForm)
							}}
						>
							{({ handleSubmit, values, handleChange, setFieldValue }) => (
								<FormDiv onSubmit={handleSubmit}>
									<h3
										style={{
											color: theme.dark.fonts.title_headers,
											fontWeight: 'normal',
										}}
									>
										Datos de Sala
									</h3>
									<FieldsContainer>
										<FormikInputValue
											placeholder='Nombre de la sala'
											type='text'
											name='room_name'
											title='Titulo para la Sala'
											size={1}
											readOnly={updateView ? !updateMode : false}
										/>
										<FormikInputValue
											placeholder='Tipo de Juego'
											name='typeOfGame'
											title='Tipo de Juego'
											type='select'
											size={2}
											disabled={updateView ? !updateMode : false}
										>
											<option>Series 12000</option>
											<option>Series 4000</option>
										</FormikInputValue>
										<FormikInputValue
											placeholder='Tipo de jugada'
											name='play'
											title='Tipo de jugada'
											type='select'
											size={2}
											disabled={updateView ? !updateMode : false}
										>
											<option>Carton</option>
											<option>Serie</option>
										</FormikInputValue>
										<FieldsPorcenContainer>
											<PorcenSubHeader $position='top'>
												Porcentajes de recoleccion
											</PorcenSubHeader>
											<FormikInputValue
												placeholder='Comision del Juego'
												type='number'
												name='comision'
												title='Comision'
												min={0}
												max={100}
												size={3}
												design={2}
												simbol='%'
												readOnly={updateView ? !updateMode : false}
											/>
											<FormikInputValue
												placeholder='Acumulado premios'
												type='number'
												name='pote_especial'
												title='Premios especiales'
												min={0}
												max={100}
												size={3}
												design={2}
												simbol='%'
												readOnly={updateView ? !updateMode : false}
											/>
											<FormikInputValue
												placeholder='Porcentaje a repartir'
												type='number'
												name='premios'
												title='Premios'
												min={0}
												max={100}
												size={3}
												design={2}
												simbol='%'
												readOnly={updateView ? !updateMode : false}
											/>
											<PorcenSubHeader $position='bottom'>
												La suma de los procentajes debe ser igual a 100%
											</PorcenSubHeader>
										</FieldsPorcenContainer>
										<RewardsDistribution
											values={values}
											handleChange={handleChange}
											setFieldValue={setFieldValue}
										/>
										<TaxesForm
											values={values}
											updateView={updateView}
											updateMode={updateMode}
										/>
										<FormikInputValue
											placeholder='Precio'
											type='number'
											name='card_price'
											title='Precio de Carton'
											size={2}
											simbol='$'
											readOnly={updateView ? !updateMode : false}
										/>
										<FormikInputValue
											placeholder='Cant minima'
											type='number'
											name='min_value'
											title='Cantidad minima de cartones/series para inicio de partida'
											size={2}
											readOnly={updateView ? !updateMode : false}
										/>
									</FieldsContainer>
									<JuegoAsociado value={updateView} status={values.status} />
									{!updateView ? (
										<Button type='submit' color='green' icoUrl={addIcon}>
											Crear Sala
										</Button>
									) : (
										updateMode && (
											<Button type='submit' color='purple' icoUrl={saveIcon}>
												Guardar Edicion
											</Button>
										)
									)}
								</FormDiv>
							)}
						</Formik>
					</div>
				</div>
			)}
		</>
	)
}
