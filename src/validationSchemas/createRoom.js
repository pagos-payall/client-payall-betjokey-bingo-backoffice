import * as yup from 'yup'

export const createRoomValidationSchema = yup.object({
  room_name: yup
    .string()
    .matches(/^[a-zA-Z0-9_.,$€£¥₩]+$/, "Solo se permiten letras, números y guiones bajos")
    .required('Es requerido un titulo para la sala'),
  typeOfGame: yup
    .mixed()
    .oneOf(['Series 12000', 'Series 4000'])
    .required('El tipo de bingo es requerido'),
  card_price: yup
    .number()
    .min(0)
    .positive()
    .required('Es requerido precio para el carton'),
  comision: yup
    .number()
    .min(0)
    .max(100)
    .positive()
    .required('Indique el porcentaje de comision que gana la casa'),
  play: yup
    .mixed()
    .oneOf(['Carton', 'Serie'])
    .required('Selecciones el tipo de jugada permitida'),
  pote_especial:yup
    .number()
    .min(0)
    .max(100)
    .positive()
    .required('Indique el porcentaje que se guarda para premios'),
  premios:yup
    .number()
    .min(0)
    .max(100)
    .positive()
    .required('Indique el porcentaje que se reparte en premios'),
  min_value: yup
    .number()
    .positive()
    .min(0)
    .required('Ingrese la cantidad minima recaudada para dar inicio a una partida'),
  taxes: yup
    .array().of(
      yup.object({
        name: yup.string(),
        value: yup.number()
      }).optional()
    ),
  carton_full: yup
      .boolean(),
  linea_full: yup
      .boolean(),
  porcen_premio_asignado_carton: yup
      .number()
      .min(0)
      .max(100),
  porcen_premio_asignado_linea: yup
      .number()
      .min(0)
      .max(100),
  cant_cartones_premiados: yup
    .number()
    .min(0)
    .integer()
    .required('Ingrese la cantidad max de cartones que pueden ganar'),
  cant_lineas_premiadas: yup
    .number()
    .min(0)
    .positive()
    .integer()
    .required('Ingrese la cantidad max de cartones que pueden ganar')
})

