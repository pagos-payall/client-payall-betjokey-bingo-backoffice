import { SubTitle, Header, Document } from '../ModalStyles'

const DefaultTemplate = ({ data, title }) => {
	const { username, date, operation } = data

	return (
		<Document>
			<h2 style={{ width: '100%' }}>{title}</h2>
			<Header>
				<SubTitle>
					<strong>Usuario operador: </strong>
					{username}
				</SubTitle>
				<SubTitle>
					<strong>Operación: </strong>
					{operation}
				</SubTitle>
				<SubTitle>
					<strong>Fecha: </strong>
					{new Date(date).toString()}
				</SubTitle>
			</Header>
		</Document>
	)
}

export default DefaultTemplate
