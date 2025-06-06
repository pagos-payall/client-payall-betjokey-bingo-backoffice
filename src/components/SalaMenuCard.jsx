import Separator from './Separator';
import { theme } from '../data/themes';
import styled from 'styled-components';
import StatusLight from './StatusLight';
import Link from 'next/link';

const SalaStyle = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	border-radius: 10px;
	background: ${theme.dark.background.secundary};
	padding: 10px;
	transition: 0.35s ease-in-out;

	&:hover {
		filter: invert(10%);
	}
`;

const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: no-wrap;
`;

const DescriptionItemStyle = styled.div`
	display: flex;
	gap: 2px;
	justify-content: space-between;
`;

const DescriptionItem = ({ title, children }) => {
	if (title.includes('Hora')) {
		let date = new Date(children);
		children = date.toString();
	}

	return (
		<DescriptionItemStyle>
			<h6 style={{ color: theme.dark.fonts.subHeaders_text }}>{title}:</h6>
			<p
				style={{
					minWidth: '100px',
					textAlign: 'right',
					color: theme.dark.fonts.subHeaders_text,
				}}
			>
				{children}
			</p>
		</DescriptionItemStyle>
	);
};

const SalaMenuCard = ({ data }) => {
	return (
		<Link
			href={{
				pathname: '/dashboard/roomForm',
				query: JSON.stringify(data),
			}}
		>
			<SalaStyle>
				<CardHeader>
					<h5 style={{ color: theme.dark.fonts.title_headers }}>
						{data.room_name} - {data.room_id}
					</h5>
					<div
						style={{
							display: 'flex',
							gap: '5px',
							alignItems: 'center',
							justifyContent: 'space-around',
						}}
					>
						<p
							style={{
								color: theme.dark.fonts.subHeaders_text,
							}}
						>
							{data.status}
						</p>
						<StatusLight status={data.status} />
					</div>
				</CardHeader>
				<Separator width={100} color={theme.dark.borders.secundary} />
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						gap: '2.5px',
					}}
				>
					<DescriptionItem title='Tipo de juego'>
						{data.game.typeOfGame}
					</DescriptionItem>
					<DescriptionItem title='Admin/creador'>
						{data.host_username}
					</DescriptionItem>
					{data.game.ref ? (
						<DescriptionItem title='Hora de despliegue'>
							2024-03-01T18:29:51.136+00:00
						</DescriptionItem>
					) : (
						<DescriptionItem title='Juego'>Sin juego asignado</DescriptionItem>
					)}
				</div>
			</SalaStyle>
		</Link>
	);
};

export default SalaMenuCard;
