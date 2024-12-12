'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import InputRequirement from '@/components/login/InputRequirement'
import Button from '@/components/Button'
import { FormDiv } from '@/components/styled/roomForm'
import FormikInputValue, {
	FormikPassInput,
} from '@/components/FormikInputValue'
import { Formik } from 'formik'
import { theme } from '@/data/themes'
import { saveChangeIcon, refreshIcon } from '@/data/icons'
import useFetch from '@/hooks/useFetch'

export default function SetPassword() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [username, setUsername] = useState(undefined)
	const { fetchAPICall } = useFetch()
	const [validateDisabled, setValidateDisabled] = useState(true)
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
		fetchAPICall('auth', 'post', obj)
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
			{({
				isSubmitting,
				handleSubmit,
				handleChange,
				values,
				validateField,
			}) => (
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
						Su clave temporal ha expirado. Debe crear un contraseña permanente
					</h4>

					<FormikPassInput
						$inputType='password'
						type='password'
						name='new_password'
						title='Nueva contraseña'
						size={1}
						$validateField={() => validateField('new_password')}
						onChange={(e) => {
							handleChange(e)
							const val = e.target.value
							const mayuscula = /(?=.*[A-Z]).+$/.test(val)
							const numerico = /(?=.*\d).+$/.test(val)
							const especial = /(?=.*[-+_!@#$%^&*.,?]).+$/.test(val)
							const size = val.length >= 8
							const equals =
								e.target.value !== ''
									? values.duplicate_password === val
									: false

							setPasswordValidation(() => ({
								mayuscula,
								numerico,
								especial,
								size,
								equals,
							}))
							setValidateDisabled(() => {
								const boolean =
									mayuscula && numerico && especial && size && equals

								return !boolean
							})
						}}
					/>
					<FormikPassInput
						$inputType='password'
						type='password'
						name='duplicate_password'
						title='Repite la contraseña'
						size={1}
						$validateField={() => validateField('duplicate_password')}
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

							setValidateDisabled(() => {
								const { mayuscula, numerico, especial, size } =
									passwordValidation
								const boolean =
									mayuscula && numerico && especial && size && equals

								return !boolean
							})
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
							text='Debe contener al menos una mayúscula, un carácter especial y un carácter numérico'
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
						disabled={validateDisabled}
					>
						{!isSubmitting && 'Guardar Contraseña'}
					</Button>
				</FormDiv>
			)}
		</Formik>
	)
}
