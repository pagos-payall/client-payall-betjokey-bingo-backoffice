import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import Button from '../Button';
import { FormDiv } from '../styled/roomForm';
import FormikInputValue from '../FormikInputValue';
import { logInIcon, refreshIcon, saveChangeIcon } from '@/data/icons';
import fetchAPICall from '@/services/fetchAPICall';
import useUser from '@/hooks/useUser';

const LoginForm = () => {
	const router = useRouter();
	const { login } = useUser();
	const initialValues = {
		username: '',
		password: '',
		new_password: '',
		duplicate_password: '',
	};

	const handleSubmit = (values, resetForm) => {
		const array = Object.entries(values);
		const obj = new Object();

		for (const val of array) {
			if (initialValues[val[0]] !== val[1]) obj[val[0]] = val[1];
		}
		values = obj;
		fetchAPICall('backOffice/login', 'put', values)
			.then((res) => {
				if (res.resetPassword) router.push('/login/setpassword');
				else {
					setTimeout(router.push('/dashboard'), 2250);
					login(values.username, '123');
				}
			})
			.catch(() => {
				resetForm();
			});
	};

	return (
		<Formik
			key='login'
			initialValues={initialValues}
			onSubmit={(values, { setSubmitting, resetForm }) => {
				setSubmitting(true);
				handleSubmit(values, resetForm);
				setSubmitting(false);
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
						disable={isSubmitting}
					>
						{!isSubmitting && 'Iniciar sesión'}
					</Button>
				</FormDiv>
			)}
		</Formik>
	);
};

export default LoginForm;
