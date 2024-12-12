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
		.oneOf(['admin', 'coordinador', 'analista'], 'Escoja una de las opciones')
		.required('El rol del usuario es requerido'),
	email: yup
		.string()
		.email('El email es invalido')
		.required('El correo es requerido'),
})
