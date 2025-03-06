'use client';
import React, { useState, useEffect, useContext, Suspense } from 'react';
import { Formik } from 'formik';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { theme } from '@/data/themes';
import { isEqual } from 'lodash';
import useFetch from '@/hooks/useFetch';
import Button from '@/components/Button';
import { addIcon, closeIcon, saveIcon } from '@/data/icons';
import { createRoomValidationSchema } from '@/validationSchemas/createRoom';
import FormikInputValue, { Input } from '@/components/FormikInputValue';
import SubHeaderBar from '@/components/SubHeaderBar';
import LoadingCircle from '@/components/LoadingCircle';
import { isoShortDate } from '@/services/getISODate';
import UpdateFormHeader from '@/components/UpdateFormHeader';
import JuegoAsociado from '@/components/dashboard/JuegoAsociado';
import {
	FormDiv,
	FieldsContainer,
	FieldsPorcenContainer,
	PorcenSubHeader,
} from '@/components/styled/roomForm';
import TaxesForm from '@/components/TaxesForm';
import RoomsContext from '@/context/rooms/RoomsContext';
import RewardsDistribution from '@/components/RewardsDistribution';
import useUser from '@/hooks/useUser';
import { validateNoLeftZero } from '@/services/utilFunctions';

export default function RoomForm() {
	const { getRooms } = useContext(RoomsContext);
	const { username } = useUser();
	const { fetchAPICall } = useFetch();
	const router = useRouter();
	const searchParams = useSearchParams();
	const min_date = isoShortDate();
	const [initialValues, setInitialValues] = useState(null);
	const [updateView, setUpdateView] = useState(false);
	const [updateMode, setUpdateMode] = useState(false);
	const [porcenError, setPorcenError] = useState(false);
	const [rewardsDistError, setRewardsDistError] = useState({
		error: undefined,
		bool: false,
	});
	const [salaData, setSalaData] = useState({
		room_id: '',
		status: '',
		createAt: '',
		ref: '',
	});
	let fields = {
		host_username: 'test',
		room_name: '',
		typeOfGame: '',
		card_price: '',
		play: '',
		comision: 50,
		pote_especial: 20,
		premios: 30,
		min_value: '',
		taxes: [],
		carton_full: true,
		linea_full: true,
		porcen_premio_asignado_carton: 70,
		porcen_premio_asignado_linea: 30,
	};

	function handleSubmit(values, setSubmitting, resetForm) {
		let method = 'post';
		const formValues = values;

		if (porcenError || rewardsDistError.bool) return;

		if (values.beginsAtDate !== undefined) {
			let date = values.beginsAtDate.split('T');
			let hora = date[1].split(':');

			if (date[0] === min_date.split('T')[0] && +hora[0] < +hh)
				return toast.error('Ingrese una hora futura');
		}

		if (updateView) {
			const array = Object.entries(values);
			const obj = new Object();

			if (isEqual(values, initialValues))
				return toast.info('No se altero ningun valor de la sala');

			for (const val of array) {
				if (initialValues[val[0]] !== val[1]) obj[val[0]] = val[1];
			}
			values = obj;
			values['room_id'] = salaData.room_id;
			method = 'patch';
		}

		values.taxes = values.taxes.filter(
			(tax) => tax.name !== '' && tax.value !== 0
		);

		values['operatorName'] = username;

		fetchAPICall('bingo/rooms', method, values).then(() => {
			setSubmitting(false);
			getRooms();
			if (!updateView) resetForm();
			else {
				delete values.room_id;
				setUpdateMode(false);
				setInitialValues(formValues);
			}
		});
	}

	function handleValidatePorcen(e, values, name) {
		const { floatValue, value } = e;
		const { comision, pote_especial, premios } = values;
		const sumatoria =
			(floatValue || 0) +
			Number(comision || 0) +
			Number(pote_especial || 0) +
			Number(premios || 0) -
			Number(values[name] || 0);

		setPorcenError(sumatoria < 100);

		return sumatoria <= 100 && validateNoLeftZero(value);
	}

	useEffect(() => {
		if (searchParams.size === 0) {
			setInitialValues(fields);
			setUpdateView(false);
		} else {
			for (const key of searchParams.keys()) {
				const data = JSON.parse(key);
				const array = Object.entries(data);

				array.forEach((entrie) => {
					const [key, value] = entrie;

					if (Array.isArray(value)) {
						const obj = new Object();
						obj[key] = [];

						value.forEach((entrie_2) => {
							const array_3 = Object.entries(entrie_2);
							const obj2 = new Object();

							array_3.forEach(([key_3, value_3]) => {
								obj2[key_3] = value_3;
							});
							obj[key].push(obj2);
						});

						setInitialValues((oldValues) => ({ ...oldValues, ...obj }));
					}

					if (salaData[key] !== undefined) {
						const obj = new Object();
						obj[key] = value;
						return setSalaData((oldValues) => ({ ...oldValues, ...obj }));
					}
					if (fields[key] === undefined && typeof value !== 'object') return;
					if (typeof value === 'object') {
						const array_2 = Object.entries(value);

						return array_2.forEach((entrie_2) => {
							const [key_2, value_2] = entrie_2;

							if (fields[key_2] === undefined) return;
							else {
								const obj = new Object();
								obj[key_2] = value_2;
								setInitialValues((oldValues) => ({ ...oldValues, ...obj }));
							}
						});
					}

					const obj = new Object();
					obj[key] = value;
					setInitialValues((oldValues) => ({ ...oldValues, ...obj }));
					setUpdateView(true);
					setUpdateMode(false);
				});
			}
		}
	}, [searchParams]);

	return (
		<Suspense>
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
								$status={salaData.status}
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
							validateOnChange={false}
							validateOnBlur={false}
							validationSchema={createRoomValidationSchema}
							initialValues={{ ...initialValues }}
							onSubmit={async (values, { setSubmitting, resetForm }) =>
								handleSubmit(values, setSubmitting, resetForm)
							}
						>
							{({
								handleSubmit,
								values,
								handleChange,
								setFieldValue,
								validateField,
							}) => (
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
											$validateField={() => validateField('room_name')}
										/>
										<FormikInputValue
											placeholder='Tipo de Juego'
											name='typeOfGame'
											title='Tipo de Juego'
											$inputType='select'
											type='select'
											size={2}
											disabled={updateView ? !updateMode : false}
											$validateField={() => validateField('typeOfGame')}
										>
											<option>Series 12000</option>
											<option>Series 4000</option>
										</FormikInputValue>
										<FormikInputValue
											placeholder='Tipo de jugada'
											name='play'
											title='Tipo de jugada'
											type='select'
											$inputType='select'
											size={2}
											disabled={updateView ? !updateMode : false}
											$validateField={() => validateField('play')}
										>
											<option value={'carton - serie'}>cartón - serie</option>
											<option value={'serie'}>Serie</option>
										</FormikInputValue>
										<FieldsPorcenContainer>
											<PorcenSubHeader $position='top'>
												Distribución de la recaudación
											</PorcenSubHeader>
											<FormikInputValue
												placeholder='Comisión del Juego'
												type='text'
												$inputType='number'
												isAllowed={(e) =>
													handleValidatePorcen(e, values, 'comision')
												}
												name='comision'
												title='Comisión'
												simbol='%'
												size={3}
												design={2}
												readOnly={updateView ? !updateMode : false}
												$validateField={() => validateField('comision')}
											/>
											<FormikInputValue
												placeholder='Acumulado premios'
												$inputType='number'
												type='text'
												name='pote_especial'
												title='Premios especiales'
												size={3}
												design={2}
												simbol='%'
												isAllowed={(e) =>
													handleValidatePorcen(e, values, 'pote_especial')
												}
												readOnly={updateView ? !updateMode : false}
												$validateField={() => validateField('pote_especial')}
											/>
											<FormikInputValue
												placeholder='Porcentaje a repartir'
												$inputType='number'
												type='text'
												name='premios'
												title='Premios'
												size={3}
												design={2}
												simbol='%'
												isAllowed={(e) =>
													handleValidatePorcen(e, values, 'premios')
												}
												readOnly={updateView ? !updateMode : false}
												$validateField={() => validateField('premios')}
											/>
											<PorcenSubHeader $position='bottom'>
												La suma de los procentajes debe ser igual a 100%
											</PorcenSubHeader>
										</FieldsPorcenContainer>
										{porcenError && (
											<p
												style={{
													color: theme.dark.colors.red,
												}}
											>
												La suma de los porcentajes es inferior a 100%
											</p>
										)}
										<RewardsDistribution
											values={values}
											handleChange={handleChange}
											setFieldValue={setFieldValue}
											readOnly={updateView ? !updateMode : false}
											setError={setRewardsDistError}
										/>
										{rewardsDistError.bool && (
											<p
												style={{
													color: theme.dark.colors.red,
												}}
											>
												{rewardsDistError.error}
											</p>
										)}
										<TaxesForm
											values={values}
											updateView={updateView}
											updateMode={updateMode}
										/>
										<FormikInputValue
											placeholder='Precio'
											$inputType='number'
											type='text'
											name='card_price'
											title='Precio de Cartón'
											size={2}
											simbol='$'
											isAllowed={({ floatValue, value }) =>
												(floatValue || 0) <= 1000 && validateNoLeftZero(value)
											}
											readOnly={updateView ? !updateMode : false}
											$validateField={() => validateField('card_price')}
										/>
										<FormikInputValue
											placeholder='Cantidad mínima'
											type='text'
											$inputType='number'
											isAllowed={({ floatValue, value }) => {
												let max_cant = values?.typeOfGame.split(' ');

												return (
													(floatValue || 0) <= (max_cant[1] || 0) &&
													validateNoLeftZero(value)
												);
											}}
											name='min_value'
											title='Cantidad mínima de cartones/series para inicio de partida'
											size={2}
											readOnly={updateView ? !updateMode : false}
											$validateField={() => validateField('min_value')}
										/>
									</FieldsContainer>
									<JuegoAsociado value={updateView} $status={values.status} />
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
		</Suspense>
	);
}
