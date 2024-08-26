'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import InputRequirement from '@/components/login/InputRequirement'
import Button from '@/components/Button'
import { FormDiv } from '@/components/styled/roomForm'
import FormikInputValue from '@/components/FormikInputValue'
import { Formik } from 'formik'
import { theme } from '@/data/themes'
import { saveChangeIcon, refreshIcon } from '@/data/icons'
import fetchAPICall from '@/hooks/useFetch'

export default function SetPassword() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [username, setUsername] = useState(undefined)
	const [passwordValidation, setPasswordValidation] = useState({
		mayuscula: false,
		especial: false,
		numerico: false,
		size: false,
		equals: false,
	})
	const initialValues = {
		new_password: '',
		duplicate_password: '',
	}

	const handleSubmit = (values, resetForm) => {
		const obj = {
			username,
			new_password: values.new_password,
		}
		fetchAPICall('backOffice/login', 'put', obj)
			.then(() => {
				router.push('/login')
			})
			.catch(() => {
				resetForm()
			})
	}

	useEffect(() => {
		for (const key of searchParams.values()) {
			setUsername(key)
		}
	}, [])

	return (
		<Formik
			key='resetPassword'
			initialValues={initialValues}
			onSubmit={(values, { setSubmitting, resetForm }) => {
				setSubmitting(true)
				handleSubmit(values, resetForm)
				setSubmitting(false)
			}}
		>
			{({ isSubmitting, handleSubmit, handleChange, values }) => (
				<FormDiv
					style={{ width: '100%', marginTop: 0, paddingTop: 0 }}
					onSubmit={handleSubmit}
				>
					<h4
						style={{
							color: theme.dark.fonts.subHeaders_text,
							fontWeight: 'normal',
						}}
					>
						Su clave temporal a expirado. Debe crear un contraseña permanente
					</h4>
					<FormikInputValue
						type='password'
						name='new_password'
						title='Nueva contraseña'
						size={1}
						onChange={(e) => {
							handleChange(e)
							const val = e.target.value
							const mayuscula = /(?=.*[A-Z]).+$/.test(val)
							const numerico = /(?=.*\d).+$/.test(val)
							const especial = /(?=.*[-+_!@#$%^&*.,?]).+$/.test(val)
							const size = val.length >= 8
							const equals =
								e.target.value !== ''
									? values.duplicate_password === e.target.value
									: false

							setPasswordValidation(() => ({
								mayuscula,
								numerico,
								especial,
								size,
								equals,
							}))
						}}
					/>
					<FormikInputValue
						type='password'
						name='duplicate_password'
						title='Repite la contraseña'
						size={1}
						onChange={(e) => {
							handleChange(e)
							const equals =
								e.target.value !== ''
									? values.new_password === e.target.value
									: false

							setPasswordValidation((old) => ({
								...old,
								equals,
							}))
						}}
					/>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '5px',
						}}
					>
						<InputRequirement
							text='La clave debe coincidir'
							boolean={passwordValidation.equals}
						/>
						<InputRequirement
							text='Minimo de 8 caracteres'
							boolean={passwordValidation.size}
						/>
						<InputRequirement
							text='Debe contener al menos una mayuscula, un caracter especial y un caracter numerico'
							boolean={
								passwordValidation.mayuscula === true &&
								passwordValidation.especial === true &&
								passwordValidation.numerico === true
							}
						/>
					</div>
					<Button
						type='submit'
						color='purple'
						icoUrl={!isSubmitting ? saveChangeIcon : refreshIcon}
						disabled={isSubmitting}
					>
						{!isSubmitting && 'Guardar Contraseña'}
					</Button>
				</FormDiv>
			)}
		</Formik>
	)
}
