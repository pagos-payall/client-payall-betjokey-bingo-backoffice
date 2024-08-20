import * as yup from 'yup'

export const createUserValidationSchema = yup.object({
	names: yup
		.string()
		.matches(/^[a-zA-Z ]+$/, 'Solo se permiten letras')
		.required('El nombre es requerido'),
	lastNames: yup
		.string()
		.matches(/^[a-zA-Z ]+$/, 'Solo se permiten letras')
		.required('El apellido es requerido'),
	role: yup
		.string()
		.oneOf(['admin', 'coordinador', 'supervisor'])
		.required('El rol del usuario es requerido'),
	email: yup.string().email().required('El correo es requerido'),
})
