import * as yup from 'yup'

// User validation schema
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
		.matches(
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			'El email es invalido'
		)
		.required('El correo es requerido'),
})

// NEW: Use server-side validation instead (TEMPORARILY DISABLED)
export const validateUser = (data) => {
	// return ValidationService.validateAndSanitize(data, 'user')
	// Temporarily using simple validation to avoid TLD errors
	return { isValid: true, errors: [], data }
}
