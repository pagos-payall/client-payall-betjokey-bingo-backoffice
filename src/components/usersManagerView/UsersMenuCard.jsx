import Link from 'next/link';
import { theme } from '@/data/themes';
import StatusLight from '../StatusLight';
import styled from 'styled-components';
import Separator from '../Separator';

const UserStyle = styled.div`
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

const DescriptionItem = ({ title, children }) => (
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

const UserMenuCard = ({ data }) => (
	<Link
		href={{
			pathname: '/usersManagerView/userForm',
			query: JSON.stringify(data),
		}}
	>
		<UserStyle>
			<CardHeader>
				<h5 style={{ color: theme.dark.fonts.title_headers }}>
					{data.names + ' ' + data.lastNames}
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
				<DescriptionItem title='username'>{data.username}</DescriptionItem>
				<DescriptionItem title='Logged status'>
					{data.logged_status ? 'Activo' : 'Inactivo'}
				</DescriptionItem>
			</div>
		</UserStyle>
	</Link>
);

export default UserMenuCard;
