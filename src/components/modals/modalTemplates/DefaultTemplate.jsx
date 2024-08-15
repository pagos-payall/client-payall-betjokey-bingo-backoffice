import styled from 'styled-components'

const Container = styled.div`
	padding: 10px 20px;
	margin: 0px;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	gap: 10px;
`

const FlexBox = styled.div`
	display: flex;
	gap: 5px;
	padding: 5px;
	justify-content: space-around;
	flex-wrap: wrap;
`

const SubTitle = styled.p`
	flex-grow: 1;
	text-align: left;
	font-size: 0.75em;
`

const DefaultTemplate = ({ data, title }) => {
	const { username, date, operation } = data

	return (
		<Container style={{ flexGrow: 1 }}>
			<h2 style={{ width: '100%' }}>{title}</h2>
			<FlexBox>
				<SubTitle>
					<strong>Nombre de usuario: </strong>
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
			</FlexBox>
		</Container>
	)
}

export default DefaultTemplate
