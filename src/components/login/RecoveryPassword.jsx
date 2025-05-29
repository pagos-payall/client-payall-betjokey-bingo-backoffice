import { theme } from '@/data/themes';
import styled from 'styled-components';
import { personIcon, refreshIcon } from '@/data/icons';
import { Formik } from 'formik';
import { FormDiv } from '../styled/roomForm';
import FormikInputValue from '../FormikInputValue';
import Button from '../Button';
import React, { useState, useRef } from 'react';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/useFetch';

const validate = yup.object({
	username: yup.string().min(4).required('Es requerido un usuario o correo'),
});

const validateCode = yup.object({
	'input-0': yup.string().min(1).required(''),
	'input-1': yup.string().min(1).required(''),
	'input-2': yup.string().min(1).required(''),
	'input-3': yup.string().min(1).required(''),
	'input-4': yup.string().min(1).required(''),
	'input-5': yup.string().min(1).required(''),
});

const Link = styled.p`
	color: ${theme.dark.fonts.subHeaders_text};
	text-decoration: underline;
	font-size: 13px;
	letter-spacing: 1.5px;
	cursor: pointer;
`;

const RecoveryPassword = ({ setView, view }) => {
	const [recovery, setRecovery] = useState(false);
	const router = useRouter();
	const inputRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
	const [refUsername, setRefUsername] = useState(null);
	const [refEmail, setRefEmail] = useState(null);
	const { fetchAPICall } = useFetch();

	const handleCorreo = (value, resetForm) => {
		fetchAPICall('/auth/validate/credentials', 'put', value, true, true)
			.then((res) => {
				setRefUsername(res.username);
				setRefEmail(res.email);
				setRecovery(true);
			})
			.catch((e) => {
				resetForm();
			});
	};

	const handleValidate = (value, resetForm) => {
		const obj = {
			code: Object.values(value).toString().replaceAll(',', ''),
			username: refUsername,
		};

		fetchAPICall('/auth/validate/approval', 'put', obj, true, true)
			.then((res) => {
				res && router.push(`/login/setpassword?username=${refUsername}`);
			})
			.catch(() => {
				resetForm();
			});
	};

	const handleInputChange = (index, e) => {
		if (e.target.value.length === 1) {
			if (index === inputRef.length - 1) return;
			return inputRef[index + 1].current.focus();
		}
		if (index === 0) return;
		inputRef[index - 1].current.focus();
	};

	const handlePaste = (e, setFieldValue) => {
		const text_code = e.clipboardData.getData('Text');

		for (let i = 0; i < 6; i++) {
			setFieldValue(`input-${i}`, text_code[i]);
		}
	};

	return (
		<>
			{view ? (
				<Link onClick={() => setView(false)}>Recuperar contraseña</Link>
			) : (
				<div>
					<h4
						style={{
							color: theme.dark.fonts.subHeaders_text,
							fontWeight: 'normal',
							padding: '0 20px',
							fontSize: '0.85em',
						}}
					>
						{!recovery
							? 'Para recuperar su contraseña, ingrese usuario o correo'
							: `Ingresa el código único que fue enviado su correo ${refEmail}.`}
					</h4>
					{!recovery ? (
						<Formik
							key='user_validate'
							validationSchema={validate}
							initialValues={{ username: '' }}
							onSubmit={(value, { setSubmitting, resetForm }) => {
								setSubmitting(true);
								handleCorreo(value, resetForm);
								setSubmitting(false);
							}}
						>
							{({ isSubmitting, handleSubmit }) => (
								<FormDiv style={{ width: '100%' }} onSubmit={handleSubmit}>
									<FormikInputValue
										type='text'
										name='username'
										title='Usuario o  correo'
										size={1}
									/>
									<Button
										type='submit'
										color='purple'
										icoUrl={!isSubmitting ? personIcon : refreshIcon}
										disabled={isSubmitting}
									>
										{!isSubmitting ? 'Validar Correo' : null}
									</Button>
								</FormDiv>
							)}
						</Formik>
					) : (
						<Formik
							key='password_recovery'
							validationSchema={validateCode}
							initialValues={{
								'input-0': '',
								'input-1': '',
								'input-2': '',
								'input-3': '',
								'input-4': '',
								'input-5': '',
							}}
							onSubmit={(value, { setSubmitting, resetForm }) => {
								setSubmitting(true);
								handleValidate(value, resetForm);
								setSubmitting(false);
							}}
						>
							{({
								isSubmitting,
								handleSubmit,
								handleChange,
								errors,
								setFieldValue,
							}) => (
								<FormDiv style={{ width: '100%' }} onSubmit={handleSubmit}>
									<div
										style={{
											width: '100%',
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'space-between',
										}}
									>
										{inputRef.map((ref, index) => {
											return (
												<FormikInputValue
													type='text'
													key={index}
													name={`input-${index}`}
													size={6}
													maxLength={1}
													onPaste={(e) => handlePaste(e, setFieldValue)}
													onChange={(e) => {
														handleChange(e);
														handleInputChange(index, e);
													}}
													autoFocus={+index === 0}
													ref={ref}
													style={{
														textAlign: 'center',
														padding: '15px',
														fontSize: '1em',
														fontWeight: 'bolder',
														transition: '0.2s',
														borderColor:
															Object.keys(errors).length === 0
																? theme.dark.colors.green
																: errors[`input-${index}`] === '' &&
																  ref.current.value === '' &&
																  theme.dark.colors.red,
													}}
												/>
											);
										})}
									</div>
									<Button
										type='submit'
										color='purple'
										icoUrl={!isSubmitting ? personIcon : refreshIcon}
										disabled={isSubmitting}
									>
										{!isSubmitting ? 'Validar Correo' : null}
									</Button>
								</FormDiv>
							)}
						</Formik>
					)}
				</div>
			)}
		</>
	);
};

export default RecoveryPassword;
