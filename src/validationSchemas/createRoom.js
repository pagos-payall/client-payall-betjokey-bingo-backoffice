import * as yup from 'yup'

export const createRoomValidationSchema = yup.object({
	room_name: yup
		.string()
		.matches(
			/^[a-zA-Z0-9 _-]+$/,
			'Solo se permiten letras, números y guiones bajos'
		)
		.required('Es requerido un titulo para la sala'),
	typeOfGame: yup
		.mixed()
		.oneOf(
			['Series 12000', 'Series 4000'],
			'Tipo de juego es requerido, escoja una opción'
		)
		.required('El tipo de bingo es requerido'),
	card_price: yup
		.number()
		.typeError('Ingrese un valor válido')
		.min(0, 'El precio del cartón no puede ser negativo')
		.max(200, 'El precio del cartón no puede superar los 200')
		.positive('El valor debe ser positivo')
		.required('Es requerido precio para el cartón'),
	comision: yup
		.number()
		.typeError('Ingrese un valor válido')
		.min(0, 'El valor debe ser mayor o igual a 0')
		.max(100, 'El valor debe ser menor o igual a 100')
		.required('Indique el porcentaje de comisión que gana la casa'),
	play: yup
		.mixed()
		.oneOf(['carton', 'serie'], 'Tipo de juego es requerido, escoja una opción')
		.required('Selecciones el tipo de jugada permitida'),
	pote_especial: yup
		.number()
		.typeError('Ingrese un valor válido')
		.min(0)
		.max(100)
		.positive()
		.required('Indique el porcentaje que se guarda para premios'),
	premios: yup
		.number()
		.typeError('Ingrese un valor válido')
		.min(0)
		.max(100)
		.positive()
		.required('Indique el porcentaje que se reparte en premios'),
	min_value: yup
		.number()
		.typeError('Ingrese un valor válido')
		.positive()
		.min(0)
		.required(
			'Ingrese la cantidad minima recaudada para dar inicio a una partida'
		),
	taxes: yup.array().of(
		yup
			.object({
				name: yup.string(),
				value: yup
					.number()
					.min(1, 'El valor del impuesto debe ser mayor a 0')
					.max(100)
					.typeError('Ingrese un valor válido'),
			})
			.optional()
	),
	carton_full: yup.boolean(),
	linea_full: yup.boolean(),
	porcen_premio_asignado_carton: yup
		.number()
		.typeError('Ingrese un valor válido')
		.min(0)
		.max(100),
	porcen_premio_asignado_linea: yup
		.number()
		.typeError('Ingrese un valor válido')
		.min(0)
		.max(100),
})
