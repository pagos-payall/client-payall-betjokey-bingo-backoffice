'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useContext } from 'react'
import { isEqual } from 'lodash'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import { closeIcon, addIcon, saveIcon, mailIcon } from '@/data/icons'
import LoadingCircle from '@/components/LoadingCircle'
import SubHeaderBar from '@/components/SubHeaderBar'
import UpdateFormHeader from '@/components/UpdateFormHeader'
import FormikInputValue, { InputStyled } from '@/components/FormikInputValue'
import { FormDiv } from '@/components/styled/roomForm'
import Button from '@/components/Button'
import { FieldsContainer } from '@/components/styled/roomForm'
import { theme } from '@/data/themes'
import Separator from '@/components/Separator'
import useFetch from '@/hooks/useFetch'
import useUser from '@/hooks/useUser'
import RoomsContext from '@/context/rooms/RoomsContext'

export default function UserForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { fetchAPICall } = useFetch()
	const { username } = useUser()
	const { getUsers } = useContext(RoomsContext)
	const [credentials, setCredentials] = useState(null)
	const [initialValues, setInitialValues] = useState(null)
	const [updateView, setUpdateView] = useState(false)
	const [updateMode, setUpdateMode] = useState(false)
	const [userData, setUserData] = useState({
		username: '',
		status: '',
	})
	let fields = {
		names: '',
		lastNames: '',
		email: '',
		role: '',
	}

	function handleEmail() {
		fetchAPICall('/backOffice/notifications', 'post', credentials).then(() =>
			router.push('/usersManagerView')
		)
	}
	function handleSubmit(values, setSubmitting) {
		let method = 'post'
		if (updateView) {
			const array = Object.entries(values)
			const obj = new Object()

			if (isEqual(values, initialValues))
				return toast.info('No se altero ningun valor de la sala')

			for (const val of array) {
				if (initialValues[val[0]] !== val[1]) obj[val[0]] = val[1]
			}
			values = obj
			method = 'patch'
		}

		values['operatorName'] = username

		fetchAPICall('/backOffice', method, values).then((data) => {
			setSubmitting(false)
			getUsers()
			if (!updateView) setCredentials(data)
			else {
				delete values.username
				setInitialValues(values)
				setUpdateMode(false)
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

					if (userData[key] !== undefined) {
						const obj = new Object()
						obj[key] = value
						return setUserData((oldValues) => ({ ...oldValues, ...obj }))
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
						onClick={() => router.push('/usersManagerView/historyLog')}
					>
						{!updateView ? (
							'Creación de Usuarios'
						) : (
							<UpdateFormHeader
								name={userData.username}
								status={userData.status}
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
								JSON.stringify(initialValues.names + updateMode)
							}
							// validationSchema={createRoomValidationSchema}
							initialValues={{ ...initialValues }}
							onSubmit={async (values, { setSubmitting }) => {
								handleSubmit(values, setSubmitting)
							}}
						>
							{({ handleSubmit }) => (
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
											placeholder='Nombres'
											type='text'
											name='names'
											title='Nombres'
											size={2}
											readOnly={updateView ? !updateMode : false}
										/>
										<FormikInputValue
											placeholder='Apellidos'
											type='text'
											name='lastNames'
											title='Apellidos'
											size={2}
											readOnly={updateView ? !updateMode : false}
										/>
										<FormikInputValue
											placeholder='Role del usuario'
											name='role'
											title='Role del usuario'
											type='select'
											size={2}
											disabled={updateView ? !updateMode : false}
										>
											<option>admin</option>
											<option>coordinador</option>
											<option>supervisor</option>
										</FormikInputValue>
										<FormikInputValue
											placeholder='correo@correo.com'
											type='email'
											name='email'
											title='Correo'
											size={2}
											readOnly={updateView ? !updateMode : false}
										/>
									</FieldsContainer>
									{!credentials &&
										(!updateView ? (
											<Button type='submit' color='green' icoUrl={addIcon}>
												Crear Usuario
											</Button>
										) : (
											updateMode && (
												<Button type='submit' color='purple' icoUrl={saveIcon}>
													Guardar Edicion
												</Button>
											)
										))}
								</FormDiv>
							)}
						</Formik>
						{credentials && (
							<FormDiv>
								<Separator width={100} color={theme.dark.borders.secundary} />
								<h3
									style={{
										color: theme.dark.fonts.title_headers,
										fontWeight: 'normal',
									}}
								>
									Credenciales de inicio de sesión
								</h3>
								<p
									style={{
										fontSize: '1em',
										color: theme.dark.fonts.subHeaders_text,
									}}
								>
									Los datos de inicio de sesión pueden ser enviado a el correo
									indicado
								</p>
								<FieldsContainer style={{ gap: '5px' }}>
									<InputStyled
										title='Username'
										value={credentials.username}
										size={2}
										readOnly={true}
									/>
									<InputStyled
										title='Clave Temporal'
										value={credentials.password}
										size={2}
										readOnly={true}
									/>
									<Button
										type='button'
										color='yellow'
										icoUrl={mailIcon}
										onClick={handleEmail}
									>
										Enviar correo
									</Button>
								</FieldsContainer>
							</FormDiv>
						)}
					</div>
				</div>
			)}
		</>
	)
}
