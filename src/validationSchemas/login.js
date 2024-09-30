import * as yup from 'yup'

const loginValidate = yup.object({
	username: yup
		.string('El usuario debe ser alphanumerico')
		.min(4, 'El usuario debe tener al menos 4 caracteres')
		.required('Es requerido un usuario o correo'),
	password: yup.string().required('El campo no puede estar vacio'),
})

export default loginValidate
