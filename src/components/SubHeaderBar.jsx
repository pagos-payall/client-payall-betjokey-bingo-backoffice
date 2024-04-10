import Image from 'next/image';
import styled from 'styled-components';
import { theme } from '../data/themes';

const IconStyled = styled.div`
	background: ${theme.dark.background.secundary};
	border-radius: 10px;
	width: min-content;
	padding: 5px;
	align-items: center;
	display: flex;
	transition: 0.5s;

	&:hover {
		filter: invert(100%);
		box-shadow: 0px 0px 10px 10px rgba(255, 255, 255, 0.45);
		-webkit-box-shadow: 0px 0px 10px 10px rgba(255, 255, 255, 0.45);
		-moz-box-shadow: 0px 0px 10px 10px rgba(255, 255, 255, 0.45);
	}
`;

const SubHeaderBar = ({ children, tag = 'h3', ...props }) => {
	const H_Title = styled(tag)`
		font-weight: normal;
		color: ${theme.dark.fonts.title_headers};
	`;

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<H_Title>{children}</H_Title>
			{props.icon && (
				<IconStyled onClick={props.onClick}>
					<Image
						src={props.icon}
						alt='home_ico'
						width={props.size}
						height={props.size}
						style={{
							filter: 'invert(100%)',
							...props.style,
						}}
					/>
				</IconStyled>
			)}
		</div>
	);
};

export const IconComponent = ({ size, url, onClick, style }) => (
	<IconStyled onClick={onClick}>
		<Image
			src={url}
			alt='ico'
			width={size}
			height={size}
			style={{
				filter: 'invert(100%)',
				...style,
			}}
		/>
	</IconStyled>
);

export default SubHeaderBar;
