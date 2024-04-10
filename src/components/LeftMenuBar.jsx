'use client';
import styled from 'styled-components';
import { theme } from '../data/themes';
import { IconComponent } from './SubHeaderBar';
import {
	homeIcon,
	boltIcon,
	mailIcon,
	logOutIcon,
	settingsIcon,
	personIcon,
} from '../data/icons';
import { useRouter } from 'next/navigation';

const MenuComponent = styled.div`
	display: flex;
	flex-direction: column;
	background-color: transparent;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	width: 60px;
	max-width: 60px;
	min-width: 60px;
	border-right: 2px solid;
	border-color: ${theme.dark.borders.primary};
	border-radius: 10px 0 0px 10px;
	padding: 20px 0;
`;

const LeftMenuBar = () => {
	const router = useRouter();

	return (
		<MenuComponent>
			<div
				style={{
					flex: 0.5,
				}}
			>
				<p
					style={{
						color: 'white',
						fontWeight: 'bolder',
						fontSize: '2em',
					}}
				>
					BJ
				</p>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					flex: 1.5,
					gap: '5px',
				}}
			>
				<IconComponent size={25} url={homeIcon} />
				<IconComponent size={25} url={mailIcon} />
				<IconComponent size={25} url={boltIcon} />
				<IconComponent
					size={25}
					url={personIcon}
					onClick={() => router.push('/usersManagerView')}
				/>
				<IconComponent size={25} url={logOutIcon} />
			</div>
			<div
				style={{
					display: 'flex',
					flex: 0.5,
					flexDirection: 'column',
					justifyContent: 'flex-end',
				}}
			>
				<IconComponent size={25} url={settingsIcon} />
			</div>
		</MenuComponent>
	);
};

export default LeftMenuBar;
