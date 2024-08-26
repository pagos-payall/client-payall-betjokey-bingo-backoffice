import { Formik } from 'formik'
import { useRouter } from 'next/navigation'
import Button from '../Button'
import { FormDiv } from '../styled/roomForm'
import FormikInputValue from '../FormikInputValue'
import { logInIcon, refreshIcon } from '@/data/icons'
import useFetch from '@/hooks/useFetch'
import useUser from '@/hooks/useUser'
import * as yup from 'yup'

const validate = yup.object({
	username: yup.string().min(4).required('Es requerido un usuario o correo'),
	password: yup.string().min(1).required('El campo no puede estar vacio'),
})

const LoginForm = () => {
	const router = useRouter()
	const { login, newSession } = useUser()
	const { fetchAPICall } = useFetch()
	const initialValues = {
		username: '',
		password: '',
		new_password: '',
		duplicate_password: '',
	}

	const handleSubmit = (values, resetForm) => {
		const array = Object.entries(values)
		const obj = new Object()

		for (const val of array) {
			if (initialValues[val[0]] !== val[1]) obj[val[0]] = val[1]
		}
		values = obj
		fetchAPICall('/auth/', 'post', values)
			.then((res) => {
				if (res.resetPassword) router.push('/login/setpassword')
				else {
					login(values.username)
					setTimeout(router.push('/dashboard'), 2000)
				}
			})
			.catch((error) => {
				if (error.status === 304) {
					newSession(values)
				}
				resetForm()
			})
	}

	return (
		<>
			<Formik
				key='login'
				validationSchema={validate}
				initialValues={initialValues}
				onSubmit={(values, { setSubmitting, resetForm }) => {
					setSubmitting(true)
					handleSubmit(values, resetForm)
					setSubmitting(false)
				}}
			>
				{({ isSubmitting, handleSubmit }) => (
					<FormDiv style={{ width: '100%' }} onSubmit={handleSubmit}>
						<FormikInputValue
							type='text'
							name='username'
							title='Usuario'
							size={1}
						/>
						<FormikInputValue
							type='password'
							name='password'
							title='Contraseña'
							size={1}
						/>
						<Button
							type='submit'
							color='green'
							icoUrl={!isSubmitting ? logInIcon : refreshIcon}
							disabled={isSubmitting}
						>
							{!isSubmitting && 'Iniciar sesión'}
						</Button>
					</FormDiv>
				)}
			</Formik>
		</>
	)
}

export default LoginForm
