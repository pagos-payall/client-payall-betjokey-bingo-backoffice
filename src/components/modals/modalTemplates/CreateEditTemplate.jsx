import {
	Taxes,
	Document,
	Header,
	SubTitle,
	Operation,
	SubItems,
} from '@/components/modals/ModalStyles'

const ObjItem = ({ itemName, value }) => {
	const array = typeof value === 'object' ? Object.entries(value) : value

	return (
		<>
			<div>
				<p style={{ fontWeight: 'bold' }}>{itemName}: </p>
				<SubItems>
					{array.map(([key, value], index) => {
						if (typeof value === 'object' || Array.isArray(value))
							return <ObjItem itemName={key} value={value} key={`item${key}`} />
						else
							return (
								<div key={index} style={{ display: 'flex', gap: '2px' }}>
									<p style={{ fontWeight: 'bold' }}>{key}: </p>
									<p>{value}</p>
								</div>
							)
					})}
				</SubItems>
			</div>
		</>
	)
}

const ListObjItems = ({ array, style }) => {
	return (
		<div style={style}>
			{array.map(([key, value], index) => {
				return typeof value === 'object' || Array.isArray(value) ? (
					<ObjItem itemName={key} value={value} key={index} />
				) : (
					<p key={index}>
						<strong>{key}: </strong>
						{value}
					</p>
				)
			})}
		</div>
	)
}

const CreateEditTemplate = ({ data, title }) => {
	const { username, date, operation, operationDetails } = data
	let array

	switch (operation) {
		case 'create':
			array = Object.entries(operationDetails)
			break
		case 'edit':
			const { log_doc_new, log_doc_old } = operationDetails
			array = [Object.entries(log_doc_new), Object.entries(log_doc_old)]
	}

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
			<Operation>
				<h5>Detalles de la operación:</h5>
				<div style={{ flexGrow: 1 }}>
					{operation === 'create' && <ListObjItems array={array} />}
					{operation === 'edit' && (
						<>
							<p>
								<strong>- Datos viejos</strong>
							</p>
							<ListObjItems
								array={array[1]}
								style={{ margin: '2px 0 2px 7.5px' }}
							/>
							<p>
								<strong>- Datos nuevos</strong>
							</p>
							<ListObjItems
								array={array[0]}
								style={{ margin: '2px 0 0 7.5px' }}
							/>
						</>
					)}
				</div>
			</Operation>
		</Document>
	)
}

export default CreateEditTemplate
